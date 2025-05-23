/*
 * Copyright (c) [2024-2025] SUSE LLC
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

/**
 * Known scopes for issues.
 */
type IssuesScope = "product" | "software" | "storage" | "users";

/**
 * Source of the issue
 *
 * Which is the origin of the issue (the system, the configuration or unknown).
 */
enum IssueSource {
  /** Unknown source (it is kind of a fallback value) */
  Unknown = 0,
  /** An unexpected situation in the system (e.g., missing device). */
  System = 1,
  /** Wrong or incomplete configuration (e.g., an authentication mechanism is not set) */
  Config = 2,
}

/**
 * Issue severity
 *
 * It indicates how severe the problem is.
 */
enum IssueSeverity {
  /** Just a warning, the installation can start */
  Warn = 0,
  /** An important problem that makes the installation not possible */
  Error = 1,
}

/**
 * Pre-installation issue
 */
type Issue = {
  /** Issue description */
  description: string;
  /** Issue kind **/
  kind: string;
  /** Issue details */
  details?: string;
  /** Where the issue comes from */
  source: IssueSource;
  /** How severe is the issue */
  severity: IssueSeverity;
};

/**
 * Issues list
 */
class IssuesList {
  /** List of issues grouped by scope */
  issues: { [key: string]: Issue[] };
  /** Whether the list is empty */
  isEmpty: boolean;

  constructor(product: Issue[], software: Issue[], storage: Issue[], users: Issue[]) {
    this.issues = {
      product,
      software,
      storage,
      users,
    };
    this.isEmpty = !Object.values(this.issues).some((v) => v.length > 0);
  }

  /**
   * Creates a new list only with the issues that match the given function
   */
  filter(fn) {
    return new IssuesList(
      this.issues["product"].filter(fn),
      this.issues["software"].filter(fn),
      this.issues["storage"].filter(fn),
      this.issues["users"].filter(fn),
    );
  }
}

/**
 * Validation error
 */
type ValidationError = {
  message: string;
};

export { IssueSource, IssuesList, IssueSeverity };
export type { Issue, IssuesScope, ValidationError };
