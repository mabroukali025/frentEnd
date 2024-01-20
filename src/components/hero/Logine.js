import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';

import {
  Alert,
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

const SuiviDemande = () => {
  const [codeSuivi, setCodeSuivi] = useState('');
  const [demande, setDemande] = useState(null);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedDemande, setEditedDemande] = useState({
    nom: '',
    cin: '',
    email: '',
    type: '',
    montant: '',
    description: '',
    imageBon: null,
  });

  const handleCodeSuiviChange = (e) => {
    setCodeSuivi(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:9090/api/mains/finddemandeBycodesuiv?codeSuivi=${codeSuivi}`);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      setDemande(data);
      setError(null);
      setDialogOpen(true);
    } catch (error) {
      setError('Unable to find the request with the provided tracking code.');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenEditDialog = () => {
    setEditedDemande({
      nom: demande.nom || '',
      cin: demande.cin || '',
      email: demande.email || '',
      type: demande.type || '',
      montant: demande.montant || '',
      description: demande.description || '',
      imageBon: demande.imageBon || null,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleInputChange = (field, value) => {
    setEditedDemande({ ...editedDemande, [field]: value });
  };

  const handleSubmitChanges = async () => {
    try {
      const formData = new FormData();
      Object.entries(editedDemande).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(`http://localhost:9090/api/demmandes/${demande.id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          // Include headers if necessary, e.g., Authorization
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the demande');
      }

      setEditDialogOpen(false);
      setError(null);
      // Optionnel: Re-fetch la demande
      // handleSearch();
    } catch (error) {
      setError('Failed to update the demande: ' + error.message);
    }
  };

  return (
    <Box>
      <div style={{color:'var(--title)', marginBottom:"40px" ,marginTop:"30px"}}> <h1 >
      Suivi de demande
       </h1></div>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, maxWidth: 600, margin: 'auto', padding: 2, marginLeft: 45 }}>
        <TextField
          id="codeSuivi"
          label="Code de suivi"
          variant="outlined"
          value={codeSuivi}
          onChange={handleCodeSuiviChange}
          style={{ backgroundColor: 'var(--subtitle)' }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Rechercher
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
      <DialogTitle style={{ backgroundColor: 'blue', color: 'white',textAlign:"center" }}>
    Détails de la Demande &nbsp;: &nbsp; sous le code {demande.codeSuivi}
  </DialogTitle>
        <DialogContent>
          {demande && (
            <Box sx={{ margin: '20px' }}>
              <Typography variant="body1"><h4>État demande : </h4>{demande.msj}</Typography>
              <Typography variant="body1">
              <h4 style={{ display: 'inline' }}>Nom &nbsp;:  &nbsp; </h4>{demande.nom}
              </Typography>
              <Typography variant="body1"><h4 style={{ display: 'inline' }}>Cin      &nbsp;   &nbsp;:      &nbsp;</h4>{demande.cin}</Typography>
              <Typography variant="body1"><h4 style={{ display: 'inline' }}>Email:  &nbsp;</h4>{demande.email}</Typography>
             
              <Typography variant="body1"><h4 style={{ display: 'inline' }}>Type &nbsp;:  &nbsp;</h4>{demande.type}</Typography>
              <Typography variant="body1"><h4 style={{ display: 'inline' }}>Date &nbsp;:   &nbsp; </h4>{demande.date}</Typography>
              {demande.etat === 'Rejected' && (
                <Button
                onClick={handleOpenEditDialog}
                variant="contained"
                startIcon={<EditIcon />}
              >
                Modifier
              </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Modifier Demande</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="nom"
            label="Nom"
            type="text"
            fullWidth
            variant="outlined"
            value={editedDemande.nom}
            onChange={(e) => handleInputChange('nom', e.target.value)}
          />
          <TextField
            margin="dense"
            id="cin"
            label="CIN"
            type="text"
            fullWidth
            variant="outlined"
            value={editedDemande.cin}
            onChange={(e) => handleInputChange('cin', e.target.value)}
          />
          <TextField
            margin="dense"
            id="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editedDemande.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          <TextField
            margin="dense"
            id="type"
            label="Type"
            type="text"
            fullWidth
            variant="outlined"
            value={editedDemande.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
          />
          <TextField
            margin="dense"
            id="montant"
            label="Montant"
            type="number"
            fullWidth
            variant="outlined"
            value={editedDemande.montant}
            onChange={(e) => handleInputChange('montant', e.target.value)}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editedDemande.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmitChanges}>Annuler</Button>
          <Button onClick={handleCloseEditDialog} variant="contained">
            Enregistrer les modifications
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuiviDemande;