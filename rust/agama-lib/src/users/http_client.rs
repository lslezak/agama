// Copyright (c) [2024] SUSE LLC
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

use super::client::{FirstUser, RootUser};
use crate::http::{BaseHTTPClient, BaseHTTPClientError};
use crate::users::model::RootPatchSettings;

#[derive(Debug, thiserror::Error)]
pub enum UsersHTTPClientError {
    #[error(transparent)]
    HTTP(#[from] BaseHTTPClientError),
    #[error("Wrong user parameters: '{0:?}'")]
    WrongUser(Vec<String>),
    #[error("Could not parse user issues: {0}")]
    InvalidUserIssues(#[from] serde_json::Error),
}

pub struct UsersHTTPClient {
    client: BaseHTTPClient,
}

impl UsersHTTPClient {
    pub fn new(client: BaseHTTPClient) -> Self {
        Self { client }
    }

    /// Returns the settings for first non admin user
    pub async fn first_user(&self) -> Result<FirstUser, UsersHTTPClientError> {
        Ok(self.client.get("/users/first").await?)
    }

    /// Set the configuration for the first user
    pub async fn set_first_user(&self, first_user: &FirstUser) -> Result<(), UsersHTTPClientError> {
        let result = self.client.put_void("/users/first", first_user).await;

        if let Err(BaseHTTPClientError::BackendError(422, ref issues_s)) = result {
            return match serde_json::from_str::<Vec<String>>(issues_s) {
                Ok(issues) => Err(UsersHTTPClientError::WrongUser(issues)),
                Err(e) => Err(UsersHTTPClientError::InvalidUserIssues(e)),
            };
        }

        Ok(result?)
    }

    pub async fn root_user(&self) -> Result<RootUser, UsersHTTPClientError> {
        Ok(self.client.get("/users/root").await?)
    }

    /// SetRootPassword method.
    /// Returns 0 if successful (always, for current backend)
    pub async fn set_root_password(
        &self,
        value: &str,
        hashed: bool,
    ) -> Result<u32, UsersHTTPClientError> {
        let rps = RootPatchSettings {
            ssh_public_key: None,
            password: Some(value.to_owned()),
            hashed_password: Some(hashed),
        };
        let ret = self.client.patch("/users/root", &rps).await?;
        Ok(ret)
    }

    /// SetRootSSHKey method.
    /// Returns 0 if successful (always, for current backend)
    pub async fn set_root_sshkey(&self, value: &str) -> Result<u32, UsersHTTPClientError> {
        let rps = RootPatchSettings {
            ssh_public_key: Some(value.to_owned()),
            password: None,
            hashed_password: None,
        };
        let ret = self.client.patch("/users/root", &rps).await?;
        Ok(ret)
    }
}
