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

pub mod bootloader;
pub mod cert;
pub mod dbus;
pub mod error;
pub mod files;
pub mod hostname;
pub mod l10n;
pub mod logs;
pub mod manager;
pub mod network;
pub mod profile;
pub mod questions;
pub mod scripts;
pub mod security;
pub mod software;
pub mod storage;
pub mod users;
pub mod web;
pub use web::service;
