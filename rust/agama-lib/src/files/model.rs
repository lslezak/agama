// Copyright (c) [2025] SUSE LLC
//
// All Rights Reserved.
//
// This program is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the Free
// Software Foundation; either version 2 of the License, or (at your option)
// any later version.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, contact SUSE LLC.
//
// To contact SUSE LLC about this file by physical or electronic mail, you may
// find current contact information at www.suse.com.

//! Implements a data model for Files configuration.

use super::error::FileError;
use crate::file_source::{FileSource, WithFileSource};
use serde::{Deserialize, Serialize};
use std::{path::Path, process};

/// Represents individual settings for single file deployment
#[derive(Clone, Debug, Serialize, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UserFile {
    /// File content or URL.
    #[serde(flatten)]
    pub source: FileSource,
    /// Permissions for file
    #[serde(default = "UserFile::default_permissions")]
    pub permissions: String, // TODO: better type?
    /// User owning the file
    #[serde(default = "UserFile::default_user")]
    pub user: String,
    /// Group owning the file
    #[serde(default = "UserFile::default_group")]
    pub group: String,
    /// destination for file like "/etc/config.d/my.conf"
    pub destination: String,
}

impl UserFile {
    fn default_permissions() -> String {
        "0644".to_string()
    }

    fn default_user() -> String {
        "root".to_string()
    }

    fn default_group() -> String {
        "root".to_string()
    }
}

impl Default for UserFile {
    fn default() -> Self {
        Self {
            source: FileSource::Text {
                content: "".to_string(),
            },
            permissions: Self::default_permissions(),
            user: Self::default_user(),
            group: Self::default_group(),
            destination: "/dev/null".to_string(), // should be always defined
        }
    }
}

impl UserFile {
    pub async fn write(&self) -> Result<(), FileError> {
        let int_mode = u32::from_str_radix(&self.permissions, 8)?;
        let path_s = "/mnt".to_string() + &self.destination;
        let path = Path::new(path_s.as_str());
        let target_path = Path::new(&self.destination);
        // at first ensure that path to file exists
        let fallback_root = Path::new("/");
        let mut cmd = process::Command::new("chroot");
        cmd.args([
            "/mnt",
            "install",
            "-d",
            "-o",
            &self.user,
            "-g",
            &self.group,
            // second unwrap is ok as it fails only for non-utf paths which should not happen
            target_path
                .parent()
                .unwrap_or(fallback_root)
                .to_str()
                .unwrap(),
        ]);
        let output = cmd.output()?;
        if !output.status.success() {
            return Err(FileError::MkdirError(
                format!("{:?}", cmd),
                String::from_utf8(output.stderr).unwrap(),
            ));
        }
        // cannot set owner here as user and group can exist only on target destination
        self.source.write(path, int_mode)?;

        let mut cmd2 = process::Command::new("chroot");
        cmd2.args([
            "/mnt",
            "chown",
            format!("{}:{}", &self.user, &self.group).as_str(),
            target_path.to_str().unwrap(),
        ]);
        // so lets set user and group afterwards..it should not be security issue as original owner is root so it basically just reduce restriction
        let output2 = cmd2.output()?;
        if !output2.status.success() {
            return Err(FileError::OwnerChangeError(
                format!("{:?}", cmd2),
                String::from_utf8(output2.stderr).unwrap(),
            ));
        }
        Ok(())
    }
}

impl WithFileSource for UserFile {
    /// File source.
    fn file_source(&self) -> &FileSource {
        &self.source
    }

    /// Mutable file source.
    fn file_source_mut(&mut self) -> &mut FileSource {
        &mut self.source
    }
}
