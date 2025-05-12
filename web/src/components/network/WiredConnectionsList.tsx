/*
 * Copyright (c) [2025] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License, or (at your option)
 * any later version.
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

import React, { useId } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import {
  Button,
  Content,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListProps,
  Flex,
} from "@patternfly/react-core";
import a11yStyles from "@patternfly/react-styles/css/utilities/Accessibility/accessibility";
import { EmptyState } from "~/components/core";
import { Connection } from "~/types/network";
import { useConnections, useNetworkDevices } from "~/queries/network";
import { NETWORK as PATHS } from "~/routes/paths";
import { formatIp } from "~/utils/network";
import { sprintf } from "sprintf-js";
import { _ } from "~/i18n";
import Annotation from "../core/Annotation";

type ConnectionListItemProps = { connection: Connection };

const ConnectionListItem = ({ connection }: ConnectionListItemProps) => {
  const nameId = useId();
  const ipId = useId();
  const devices = useNetworkDevices();

  const device = devices.find(
    ({ connection: deviceConnectionId }) => deviceConnectionId === connection.id,
  );
  const addresses = device ? device.addresses : connection.addresses;

  return (
    <DataListItem id={connection.id} aria-labelledby={nameId} aria-describedby={ipId}>
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="name">
              <Flex gap={{ default: "gapXs" }} direction={{ default: "column" }}>
                <Content id={nameId} isEditorial>
                  {connection.id}
                </Content>
                <Content id={ipId} component="small">
                  <Content className={a11yStyles.screenReader}>{_("IP addresses")}</Content>
                  {addresses.map(formatIp).join(", ")}
                </Content>
                <Annotation>{_("Configured for installation only")}</Annotation>
              </Flex>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
    </DataListItem>
  );
};

/**
 * Component for displaying a list of available wired connections
 */
function WiredConnectionsList(props: DataListProps) {
  const navigate = useNavigate();
  const connections = useConnections();
  const wiredConnections = connections.filter((c) => !c.wireless);

  if (wiredConnections.length === 0) {
    const [textStart, link, textEnd] = sprintf(
      _(
        "There are [%s available] connections for use, but they are not part of the current setup.",
      ),
      2,
    ).split(/[[\]]/);

    return (
      <EmptyState title={_("No wired connections configured yet")} icon="error">
        <Content component="p">
          {textStart}{" "}
          <Button isInline variant="link">
            {link}
          </Button>{" "}
          {textEnd}
        </Content>
      </EmptyState>
    );
  }

  return (
    <DataList
      onSelectDataListItem={(_, id) => navigate(generatePath(PATHS.wiredConnection, { id }))}
      {...props}
    >
      {wiredConnections.map((c: Connection) => (
        <ConnectionListItem key={c.id} connection={c} />
      ))}
    </DataList>
  );
}

export default WiredConnectionsList;
