import { useState } from 'react';
import {
  Box,
  Typography
} from "@mui/material";
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import ResultsTableModalBody from './ResultsTableModalBody';
import config from '../../../config/config.json';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


const ResultsTableRowModal = ({ subRow }) => {
  const [open, setOpen] = useState(true);  
  const handleClose = () => setOpen(false);

  console.log(subRow);

  return (
    <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
      <Fade in={open}>
        <Box sx={style}>
          <Box>
            <Typography id="modal-modal-title" 
              sx={{ 
                fontWeight: "bold",
                fontSize: "16px",
                color: `${ config.ui.colors.darkPrimary }`
              }}>
              Results detailed table
            </Typography>
          </Box>
          <Box>
            { subRow.beaconId  && (
              <Box
                sx={{
                  display: "flex"
                }}>
                <Typography sx={{
                  color: "black",
                  fontWeight: 700,
                  fontSize: "16px",
                  paddingRight: "10px"
                }}>
                  Beacon:
                </Typography>
                <Typography sx={{
                  color: "black",
                  fontWeight: 700,
                  fontSize: "16px",
                }}>
                  { subRow.beaconId }
                </Typography>
              </Box>
            )}
            { subRow.id  && (
              <Box
                sx={{
                  display: "flex",
                  paddingTop: "10px",
                  paddingBottom: "30px"
                }}>
                <Typography sx={{
                  color: `${ config.ui.colors.darkPrimary }`,
                  fontSize: "16px",
                  paddingRight: "10px",
                }}>
                  Dataset:
                </Typography>
                <Typography sx={{
                  color: `${ config.ui.colors.darkPrimary }`,
                  fontWeight: 700,
                  fontSize: "16px",
                }}>
                  { subRow.id }
                </Typography>
              </Box>
            )}
            <Box>
              {/* <ResultsTableModalBody baseItem={subRow} /> */}
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