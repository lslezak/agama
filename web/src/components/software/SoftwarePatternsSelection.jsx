/*
 * Copyright (c) [2023-2024] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of version 2 of the GNU General Public License as published
 * by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Label,
  DataList,
  DataListCell,
  DataListCheck,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  SearchInput,
  Stack,
} from "@patternfly/react-core";

import { Section, Page } from "~/components/core";
import { _ } from "~/i18n";
import { SelectedBy } from "~/client/software";
import { useInstallerClient } from "~/context/installer";
import { useCancellablePromise } from "~/utils";

/**
 * @typedef {Object} Pattern
 * @property {string} name pattern name (internal ID)
 * @property {string} group pattern group
 * @property {string} summary pattern name (user visible)
 * @property {string} description long description of the pattern
 * @property {string} order display order
 * @property {string} icon icon name (not path or file name!)
 * @property {number} selected who selected the pattern, undefined
 *   means it is not selected to install
 */

/**
 * @typedef {Object.<string, Array<Pattern>} PatternGroups mapping "group name" =>
 * list of patterns
 */

/**
 * Group the patterns with the same group name
 * @param {Array<Pattern>} patterns input
 * @return {PatternGroups}
 */
function groupPatterns(patterns) {
  const groups = {};

  patterns.forEach((pattern) => {
    if (groups[pattern.category]) {
      groups[pattern.category].push(pattern);
    } else {
      groups[pattern.category] = [pattern];
    }
  });

  // sort patterns by the "order" value
  Object.keys(groups).forEach((group) => {
    groups[group].sort((p1, p2) => {
      if (p1.order === p2.order) {
        // there should be no patterns with the same name
        return p1.name < p2.name ? -1 : 1;
      } else {
        return p1.order - p2.order;
      }
    });
  });

  return groups;
}

/**
 * Sort pattern group names
 * @param {PatternGroups} groups input
 * @returns {Array<string>} sorted pattern group names
 */
function sortGroups(groups) {
  return Object.keys(groups).sort((g1, g2) => {
    const order1 = groups[g1][0].order;
    const order2 = groups[g2][0].order;
    return order1 - order2;
  });
}

/**
 * Builds a list of patterns include its selection status
 *
 * @param {import("~/client/software").Pattern[]} patterns - Patterns from the HTTP API
 * @param {Object.<string, number>} selection - Patterns selection
 * @return {Pattern[]} List of patterns including its selection status
 */
function buildPatterns(patterns, selection) {
  return patterns
    .map((pattern) => {
      const selectedBy = selection[pattern.name] !== undefined ? selection[pattern.name] : 2;
      return {
        ...pattern,
        selectedBy,
      };
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Pattern selector component
 */
function SoftwarePatternsSelection() {
  const client = useInstallerClient();
  const [patterns, setPatterns] = useState([]);
  const [proposal, setProposal] = useState({ patterns: {}, size: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [visiblePatterns, setVisiblePatterns] = useState(patterns);
  const [searchValue, setSearchValue] = useState("");
  const { cancellablePromise } = useCancellablePromise();

  useEffect(() => {
    if (patterns.length !== 0) return;

    const loadPatterns = async () => {
      const patterns = await cancellablePromise(client.software.getPatterns());
      const proposal = await cancellablePromise(client.software.getProposal());
      setPatterns(buildPatterns(patterns, proposal.patterns));
      setProposal(proposal);
      setIsLoading(false);
    };

    loadPatterns();
  }, [client.software, patterns, cancellablePromise]);

  useEffect(() => {
    if (!patterns) return;

    // filtering - search the required text in the name and pattern description
    if (searchValue !== "") {
      // case insensitive search
      const searchData = searchValue.toUpperCase();
      const filtered = patterns.filter(
        (p) =>
          p.name.toUpperCase().indexOf(searchData) !== -1 ||
          p.description.toUpperCase().indexOf(searchData) !== -1,
      );
      setVisiblePatterns(filtered);
    } else {
      setVisiblePatterns(patterns);
    }

    return client.software.onSelectedPatternsChanged((selection) => {
      client.software.getProposal().then((proposal) => setProposal(proposal));
      setPatterns(buildPatterns(patterns, selection));
    });
  }, [patterns, searchValue, client.software]);

  const onToggle = useCallback(
    (name) => {
      const selected = patterns
        .filter((p) => p.selectedBy === SelectedBy.USER)
        .reduce((all, p) => {
          all[p.name] = true;
          return all;
        }, {});
      const pattern = patterns.find((p) => p.name === name);
      selected[name] = pattern.selectedBy === SelectedBy.NONE;

      client.software.selectPatterns(selected);
    },
    [patterns, client.software],
  );

  // FIXME: use loading indicator when busy, we cannot know if it will be
  // quickly or not in advance.

  // initial empty screen, the patterns are loaded very quickly, no need for any progress
  if (visiblePatterns.length === 0 && searchValue === "") return null;

  const groups = groupPatterns(visiblePatterns);

  // FIXME: use a switch instead of a checkbox since these patterns are going to
  // be selected/deselected immediately.
  // TODO: extract to a DataListSelector component or so.
  let selector = sortGroups(groups).map((groupName) => {
    const selectedIds = groups[groupName]
      .filter((p) => p.selectedBy !== SelectedBy.NONE)
      .map((p) => p.name);
    return (
      <Section key={groupName} title={groupName}>
        <DataList isCompact>
          {groups[groupName].map((option) => (
            <DataListItem key={option.name}>
              <DataListItemRow>
                <DataListCheck
                  onChange={() => onToggle(option.name)}
                  aria-labelledby="check-action-item1"
                  name="check-action-check1"
                  isChecked={selectedIds.includes(option.name)}
                />
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="summary">
                      <Stack hasGutter>
                        <div>
                          <b>{option.summary}</b>{" "}
                          {option.selectedBy === SelectedBy.AUTO && (
                            <Label color="blue" isCompact>
                              {_("auto selected")}
                            </Label>
                          )}
                        </div>
                        <div>{option.description}</div>
                      </Stack>
                    </DataListCell>,
                  ]}
                />
              </DataListItemRow>
            </DataListItem>
          ))}
        </DataList>
      </Section>
    );
  });

  if (selector.length === 0) {
    selector = <b>{_("None of the patterns match the filter.")}</b>;
  }

  return (
    <>
      <Page.Header>
        <Stack hasGutter>
          <h2>{_("Software selection")}</h2>
          <SearchInput
            // TRANSLATORS: search field placeholder text
            placeholder={_("Filter by pattern title or description")}
            aria-label={_("Filter by pattern title or description")}
            value={searchValue}
            onChange={(_event, value) => setSearchValue(value)}
            onClear={() => setSearchValue("")}
            resultsCount={visiblePatterns.length}
          />
        </Stack>
      </Page.Header>

      <Page.MainContent>
        <Card isRounded>
          <CardBody>{selector}</CardBody>
        </Card>
      </Page.MainContent>

      <Page.NextActions>
        <Page.Action navigateTo="..">{_("Close")}</Page.Action>
      </Page.NextActions>
    </>
  );
}

export default SoftwarePatternsSelection;
