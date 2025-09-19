import config from "../../config/config.json";
import BeaconNetworkBanner from "./BeaconNetworkBanner";
import SingleBeaconBanner from "./SingleBeaconBanner";
import { Box } from "@mui/material";

/**
 * This component shows a banner at the bottom of the page.
 * The banner changes depending on the "beaconType" setting in the config file
 *
 * - If beaconType = "networkBeacon", it shows the network banner.
 * - If beaconType = "singleBeacon", it shows the single banner.
 *
 * Styles are shared for both banners to keep them consistent.
 */
export default function BeaconTypeBanner() {
  // Get the type of beacon from the config file
  const beaconType = config.beaconType;

  // Common styles for the banner container
  const sharedStyles = {
    boxShadow: "0px 8px 11px 0px #9BA0AB24",
    minHeight: "218px",
    width: "100%",
    display: "flex",
    marginTop: { lg: "-60px", md: "-60px", sm: "0px", xs: "0px" },
    overflow: "hidden",
    mb: 3,
    borderRadius: "8px",
  };

  // This will hold the correct banner component to render
  let content = null;

  // If the beacon is a network type, use the network banner
  if (beaconType === "networkBeacon") {
    content = <BeaconNetworkBanner />;
  }
  // If the beacon is a single type, use the single banner
  else if (beaconType === "singleBeacon") {
    content = <SingleBeaconBanner />;
  }

  // If beaconType is something else or undefined, show nothing
  if (!content) return null;

  // Return the chosen banner inside a styled Box container
  return <Box sx={sharedStyles}>{content}</Box>;
}
