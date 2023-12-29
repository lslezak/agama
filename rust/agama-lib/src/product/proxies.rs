//! # DBus interface proxy for: `org.opensuse.Agama1.Registration`
//!
//! This code was generated by `zbus-xmlgen` `3.1.1` from DBus introspection data.
use zbus::dbus_proxy;

#[dbus_proxy(
    interface = "org.opensuse.Agama1.Registration",
    default_service = "org.opensuse.Agama.Software1",
    default_path = "/org/opensuse/Agama/Software1/Product"
)]
trait Registration {
    /// Deregister method
    fn deregister(&self) -> zbus::Result<(u32, String)>;

    /// Register method
    fn register(
        &self,
        reg_code: &str,
        options: std::collections::HashMap<&str, zbus::zvariant::Value<'_>>,
    ) -> zbus::Result<(u32, String)>;

    /// Email property
    #[dbus_proxy(property)]
    fn email(&self) -> zbus::Result<String>;

    /// RegCode property
    #[dbus_proxy(property)]
    fn reg_code(&self) -> zbus::Result<String>;

    /// Requirement property
    #[dbus_proxy(property)]
    fn requirement(&self) -> zbus::Result<u32>;
}