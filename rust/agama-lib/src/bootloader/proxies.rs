//! # D-Bus interface proxy for: `org.opensuse.Agama.Storage1.Bootloader`
//!
//! This code was generated by `zbus-xmlgen` `5.0.1` from D-Bus introspection data.
//! Source: `org.opensuse.Agama.Storage1.bus.xml`.
//!
//! You may prefer to adapt it, instead of using it verbatim.
//!
//! More information can be found in the [Writing a client proxy] section of the zbus
//! documentation.
//!
//! This type implements the [D-Bus standard interfaces], (`org.freedesktop.DBus.*`) for which the
//! following zbus API can be used:
//!
//! * [`zbus::fdo::IntrospectableProxy`]
//! * [`zbus::fdo::ObjectManagerProxy`]
//! * [`zbus::fdo::PropertiesProxy`]
//!
//! Consequently `zbus-xmlgen` did not generate code for the above interfaces.
//!
//! [Writing a client proxy]: https://dbus2.github.io/zbus/client.html
//! [D-Bus standard interfaces]: https://dbus.freedesktop.org/doc/dbus-specification.html#standard-interfaces,
use zbus::proxy;
#[proxy(
    default_service = "org.opensuse.Agama.Storage1",
    default_path = "/org/opensuse/Agama/Storage1",
    interface = "org.opensuse.Agama.Storage1.Bootloader",
    assume_defaults = true
)]
pub trait Bootloader {
    /// GetConfig method
    fn get_config(&self) -> zbus::Result<String>;

    /// SetConfig method
    fn set_config(&self, serialized_config: &str) -> zbus::Result<u32>;
}
