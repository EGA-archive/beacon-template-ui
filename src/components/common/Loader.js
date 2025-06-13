// import { Box, Typography } from "@mui/material";
// import config from "../../config/config.json";

// export default function Loader({ message }) {
//   const loaderColor = config.ui.colors.primary;

//   return (
//     <div className="loader-container">
//       <div className="loader-wrapper">
//         <Box className="loader-message">
//           <Typography
//             translate="no"
//             sx={{ fontStyle: "italic", fontSize: "17px" }}
//           >
//             {message}
//           </Typography>
//         </Box>
//         <Box
//           sx={{
//             pt: "50px",
//             minHeight: "40px",
//           }}
//         >
//           <div className="loader" style={{ color: loaderColor }}></div>
//         </Box>
//       </div>
//     </div>
//   );
// }

import { Box, Typography } from "@mui/material";
import config from "../../config/config.json";

export default function Loader({ message, variant = "default" }) {
  const loaderColor = config.ui.colors.primary;

  const isInline = variant === "inline";

  return (
    <div className="loader-container" style={isInline ? { minHeight: 0 } : {}}>
      <div
        className="loader-wrapper"
        style={isInline ? { minHeight: "150px" } : {}}
      >
        <Box className="loader-message" sx={{ pt: isInline ? 0 : "initial" }}>
          <Typography
            translate="no"
            sx={{ fontStyle: "italic", fontSize: "17px" }}
          >
            {message}
          </Typography>
        </Box>
        <Box
          sx={{
            pt: "50px",
            minHeight: "40px",
          }}
        >
          <div className="loader" style={{ color: loaderColor }}></div>
        </Box>
      </div>
    </div>
  );
}
