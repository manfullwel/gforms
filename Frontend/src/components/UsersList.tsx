import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import {
  Block as BlockIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { AdminUser } from '../types/security';

interface UsersListProps {
  users: AdminUser[];
  onUserSelect: (userId: number) => void;
  onBlockUser: (userId: number, reason: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  onUserSelect,
  onBlockUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  const handleBlockClick = (user: AdminUser) => {
    setSelectedUser(user);
    setBlockDialogOpen(true);
  };

  const handleBlockConfirm = () => {
    if (selectedUser && blockReason) {
      onBlockUser(selectedUser.id, blockReason);
      setBlockDialogOpen(false);
      setBlockReason('');
      setSelectedUser(null);
    }
  };

  const getRiskLevelColor = (riskScore: number) => {
    if (riskScore >= 0.7) return 'error';
    if (riskScore >= 0.4) return 'warning';
    return 'success';
  };

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Usuário</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Risco</TableCell>
                <TableCell>Última Atividade</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  onClick={() => onUserSelect(user.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="body2">
                      {user.name}
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        {user.email}
                      </Typography>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Ativo' : 'Bloqueado'}
                      color={user.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<SecurityIcon />}
                      label={`${(user.risk_score * 100).toFixed(0)}%`}
                      color={getRiskLevelColor(user.risk_score)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.security_profile.last_security_audit}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="warning"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlockClick(user);
                      }}
                      disabled={!user.is_active}
                    >
                      <BlockIcon />
                    </IconButton>
                    {user.risk_score >= 0.7 && (
                      <IconButton color="error">
                        <WarningIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)}>
        <DialogTitle>Bloquear Usuário</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Você está prestes a bloquear o usuário:{' '}
            <strong>{selectedUser?.name}</strong>
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo do Bloqueio"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleBlockConfirm}
            color="error"
            disabled={!blockReason}
          >
            Confirmar Bloqueio
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersList;
