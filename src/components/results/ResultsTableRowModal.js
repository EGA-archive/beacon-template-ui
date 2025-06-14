import { useState } from 'react';
import {
  Box,
  Typography
} from "@mui/material";
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


const ResultsTableRowModal = ({ subRow }) => {
  const [open, setOpen] = useState(true);  
  const handleClose = () => setOpen(false);

  return (
    <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
      <Box sx={style}>
        <Box>
          <Typography id="modal-modal-title" variant="h5" component="h5">
            Results detailed table
          </Typography>
        </Box>
        <Box>
          <Box
            sx={{
              display: "flex"
            }}>
            <Typography sx={{
              color: "black",
              fontWeight: 700,
              fontSize: "16px",
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
          <Box
            sx={{
              display: "flex"
            }}>
            <Typography sx={{
              color: "black",
              fontWeight: 700,
              fontSize: "16px",
            }}>
              Dataset:
            </Typography>
            <Typography sx={{
              color: "black",
              fontWeight: 700,
              fontSize: "16px",
            }}>
              { subRow.beaconId }
            </Typography>
          </Box>
          <Box>
            
          </Box>
          <Box>
            
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default ResultsTableRowModal;