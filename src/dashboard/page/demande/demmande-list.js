import DoneIcon from '@mui/icons-material/Done';
import BlockIcon from '@mui/icons-material/Block';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';



 

export default function DemmandeList() {
  const [pageNumber, setPageNumber] = useState(0);
  const itemsPerPage = 4;
  const [actionDemandes, setActionDemandes] = useState({});
  const [demmandes, setDemmandes] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [selectedDemandeId, setSelectedDemandeId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const ScrollableCell = ({ value }) => {
    return (
        <div style={{ overflowY: 'auto', maxHeight: '50px' }}>
            {value}
        </div>
    );
};

  useEffect(() => {
    const fetchuDemande = async () => {
      axios.get("http://localhost:9090/api/demmandes")
        .then((response) => {
          setDemmandes(response.data);
        })
        .catch((error) => {
          console.error('Erreur lors de la récupération des demandes:', error);
        });
    };
    fetchuDemande();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this demand?")) {
      axios.delete(`http://localhost:9090/api/demmandes/deletByid/${id}`)
        .then(() => {
          setDemmandes(prevDemmandes => prevDemmandes.filter(demmande => demmande.id !== id));
        })
        .catch((error) => {
          console.error('Erreur lors de la suppression de la demande:', error);
        });
    }
  };

  const handleConfirmOrRejectDemmande = async (id, action) => {
    const newStatus = action === 'confirm' ? 'Confirmed' : 'Rejected';
    const message = userMessage || (action === 'confirm' ? 'Votre demande a été confirmée.' : 'Votre demande a été rejetée.');

    try {
      await axios.put(`http://localhost:9090/api/mains/${id}/etat?nouvelEtat=${newStatus}&nouvelMsj=${message}`,
        {
          etat: newStatus,
          msj: message
        });

      setActionDemandes(prev => ({ ...prev, [id]: action }));
      setDemmandes(prevDemmandes => prevDemmandes.map(demmande => {
        if (demmande.id === id) {
          return { ...demmande, etat: newStatus, msj: message };
        }
        return demmande;
      }));

      handleCloseModal(); // Fermer le modèle après la confirmation ou le rejet.
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la demande:', error);
      alert('Erreur lors de la mise à jour de la demande.');
    }
  };

  const handleUserMessageChange = (event) => {
    setUserMessage(event.target.value);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDemandeId(null);
  };



    const columns = [
        // ... colonnes comme avant ...
        { field: 'id', headerName: 'ID', width: 10 },
        { field: 'cin', headerName: 'CIN', width: 80, align: 'center', editable: true },
        { field: 'email', headerName: 'Email', width: 60, align: 'center', renderCell: (params) => <ScrollableCell value={params.value} />, },
        { field: 'type', headerName: 'Type', width: 50, align: 'center', editable: true },
        { field: 'montant', headerName: 'Montant', width: 60, align: 'center', editable: true },
        {
          field: 'etat',
          headerName: 'Etat',
          width: 90,
          align: 'center',
          editable: true,
          cellClassName: (params) => {
            const etat = params.row.etat;
      
            if (etat === 'Confirmed') {
              return 'etat-confirmed';
            } else if (etat === 'Rejected') {
              return 'etat-rejected';
            } else {
              return 'etat-other'; // Default styling for other cases
            }
          },
        },
        { field: 'date', headerName: 'Date', width: 54, align: 'center', renderCell: (params) => <ScrollableCell value={params.value} />,},
        { field: 'description', headerName: 'Description', width: 50, align: 'center', renderCell: (params) => <ScrollableCell value={params.value} />,},
        { field: 'msj', headerName: 'Msj', width: 240, align: 'center', editable: true },
        {
            field: 'imageBon',
            headerName: 'Image',
            width: 40,
            align: 'center',
            editable: false,
             renderCell: (params) => (<Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSelectedDemandeId(params.row.id);
                  setModalOpen(true);
                }}
              >
              <div>
                <img 
                  src={`data:image/jpeg;base64,${params.value}`}
                  alt="Image du produit"
                  style={{ height: '50px', width: 'auto', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedDemandeId(params.row.id);
                    setModalOpen(true);
                  }}
                />
               
                  
                
              </div>
              </Button>
            ),
          },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 290,
            renderCell: (params) => (
                <div>
                    <Button               
                        startIcon={<DeleteIcon />}            
                        onClick={() => handleDelete(params.row.id)}               
                    >                       
                    </Button>
                    {params.row.etat !== 'Confirmed' && (
                        <Button
                            type="button"
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<DoneIcon />}
                            onClick={() => handleConfirmOrRejectDemmande(params.row.id, 'confirm')}
                            style={{ marginRight: '5px' }}
                        >
                            Confirm
                        </Button>
                    )}
                    {params.row.etat !== 'Rejected' && (
                        <Button
                            type="button"
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<BlockIcon />}
                            onClick={() => handleConfirmOrRejectDemmande(params.row.id, 'reject')}
                        >
                            Reject
                        </Button>
                    )}
                </div>
            ),
        },
        
    ];

    const offset = pageNumber * itemsPerPage;
    const currentPageItems = demmandes.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(demmandes.length / itemsPerPage);

    return (
        <Box sx={{ height: 400, width: '100%' }}>
      <TextField
        label="Message utilisateur"
        variant="outlined"
        value={userMessage}
        onChange={handleUserMessageChange}
        style={{ marginBottom: '10px' }}
      />
      <DataGrid
        rows={demmandes}
        columns={columns}
        pageSize={itemsPerPage}
        rowCount={demmandes.length}
        onPageChange={(newPage) => setPageNumber(newPage)}
        pagination
        components={{
          Toolbar: GridToolbar,
        }}
      />
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div>
          {selectedDemandeId && (
            <img 
              src={`data:image/jpeg;base64,${demmandes.find(d => d.id === selectedDemandeId)?.imageBon}`}
              alt="Image agrandie"
              style={{ maxHeight: '80vh', maxWidth: '80vw', margin: 'auto', display: 'block' }}
            />
          )}
        </div>
      </Modal>
    </Box>
  );
}