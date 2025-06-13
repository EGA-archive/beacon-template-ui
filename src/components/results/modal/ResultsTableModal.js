import { useState, useEffect } from 'react';
import {
  Box,
  Typography
} from "@mui/material";
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import ResultsTableModalBody from './ResultsTableModalBody';
import config from '../../../config/config.json';
import CloseIcon from "@mui/icons-material/Close";
import { InputAdornment, IconButton } from "@mui/material";


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1200,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


const ResultsTableRowModal = ({ open, subRow, onClose }) => {
  return (
    <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
      <Fade in={open}>
        <Box sx={style}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <InputAdornment position="end">
              <IconButton
                onClick={() => onClose()}
                size="small"
                sx={{ color: config.ui.colors.darkPrimary }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          </Box>
          <Box>
            <Typography id="modal-modal-title" 
              sx={{ 
                fontWeight: "bold",
                fontSize: "17px",
                paddingBottom: "10px",
                color: `${ config.ui.colors.darkPrimary }`
              }}>
              Results detailed table
            </Typography>
          </Box>
          <Box>
            <Box>
              <Box>
                { subRow.beaconId  && (
                  <Box
                    sx={{
                      display: "flex"
                    }}>
                    <Typography sx={{
                      color: "black",
                      fontSize: "15px",
                      paddingRight: "10px",
                      color: `${ config.ui.colors.darkPrimary }`
                    }}>
                      Beacon:
                    </Typography>
                    <Typography sx={{
                      color: "black",
                      fontWeight: 700,
                      fontSize: "15px",
                      color: `${ config.ui.colors.darkPrimary }`
                    }}>
                      { subRow.beaconId }
                    </Typography>
                  </Box>
                )}
                { subRow.id  && (
                  <Box
                    sx={{
                      display: "flex",
                      paddingTop: "1px",
                      paddingBottom: "10px"
                    }}>
                    <Typography sx={{
                      color: `${ config.ui.colors.darkPrimary }`,
                      fontSize: "15px",
                      paddingRight: "10px",
                    }}>
                      Dataset:
                    </Typography>
                    <Typography sx={{
                      color: `${ config.ui.colors.darkPrimary }`,
                      fontWeight: 700,
                      fontSize: "15px",
                    }}>
                      { subRow.id }
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box>
                
              </Box>
            </Box>
            <Box>
              <ResultsTableModalBody baseItem={subRow} primary={ config.ui.colors.primary }/>
            </Box>
            <Box>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default ResultsTableRowModal;