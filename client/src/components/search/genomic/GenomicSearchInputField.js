import { Box, InputBase, MenuItem, Select } from "@mui/material";
import { alpha } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";

export default function GenomicSearchInputField({
  assembly,
  assemblyIds,
  genomicDraft,
  genomicInputPlaceholder,
  primaryDarkColor,
  isAssemblyOpen,
  onAssemblyChange,
  onAssemblyOpen,
  onAssemblyClose,
  onInputClick,
  onInputChange,
  onInputKeyDown,
  onClear,
  inputRef,
  children,
}) {
  const AssemblyArrowIcon = (props) =>
    isAssemblyOpen ? (
      <KeyboardArrowDownIcon {...props} />
    ) : (
      <KeyboardArrowRightRoundedIcon {...props} />
    );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        border: `1.5px solid ${primaryDarkColor}`,
        borderRadius: "999px",
        backgroundColor: "#fff",
        transition: "flex 0.3s ease",
        pr: 2,
        py: 1,
        height: "47px",
      }}
    >
      <Select
        value={assembly}
        onChange={(event) => onAssemblyChange(event.target.value)}
        onOpen={onAssemblyOpen}
        onClose={onAssemblyClose}
        variant="standard"
        disableUnderline
        IconComponent={AssemblyArrowIcon}
        sx={{
          backgroundColor: "black",
          color: "#fff",
          fontSize: "12px",
          fontWeight: 700,
          fontFamily: '"Open Sans", sans-serif',
          pl: 3,
          pr: 2,
          py: 0,
          height: "47px",
          borderTopLeftRadius: "999px",
          borderBottomLeftRadius: "999px",
          ".MuiSelect-icon": {
            color: "#fff",
            mr: 1,
          },
          ".MuiSelect-iconOpen": {
            transform: "none",
          },
        }}
      >
        {assemblyIds.map((id) => (
          <MenuItem
            key={id}
            value={id}
            sx={{
              fontSize: "12px",
            }}
          >
            {id}
          </MenuItem>
        ))}
      </Select>

      <Box
        sx={{
          width: "48px",
          height: "47px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: primaryDarkColor,
        }}
      >
        <SearchIcon />
      </Box>

      <Box
        sx={{
          position: "relative",
          flex: 1,
          minWidth: 0,
        }}
      >
        <InputBase
          onClick={onInputClick}
          inputRef={inputRef}
          placeholder={genomicInputPlaceholder}
          fullWidth
          value={genomicDraft}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onInputKeyDown}
          sx={{
            fontFamily: '"Open Sans", sans-serif',
            fontSize: "12px",
            height: "47px",
          }}
        />

        {genomicDraft?.trim() && (
          <Box
            role="button"
            aria-label="Clear genomic query"
            onClick={onClear}
            sx={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: alpha(primaryDarkColor, 0.1),
              color: primaryDarkColor,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: alpha(primaryDarkColor, 0.2),
              },
            }}
          >
            <ClearIcon
              sx={{
                fontSize: "16px",
              }}
            />
          </Box>
        )}
      </Box>

      {children}
    </Box>
  );
}
