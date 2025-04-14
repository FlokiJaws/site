import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Search, User, Mail, Calendar, Filter, ChevronDown, Users, Home, ArrowLeft } from 'lucide-react';
import './AdminUsersList.css';

const AdminUsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    sortBy: 'newest'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(usersQuery);
        
        const usersData = [];
        querySnapshot.forEach(doc => {
          usersData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setUsers(usersData);
        setFilteredUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Erreur lors de la récupération des utilisateurs');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, users]);

  const applyFilters = () => {
    let result = [...users];
    
    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => {
        const nameMatch = user.displayName && user.displayName.toLowerCase().includes(term);
        const emailMatch = user.email && user.email.toLowerCase().includes(term);
        return nameMatch || emailMatch;
      });
    }
    
    // Filtre par rôle
    if (filters.role !== 'all') {
      result = result.filter(user => user.role === filters.role);
    }
    
    // Tri
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => {
          const dateA = a.createdAt ? a.createdAt.seconds : 0;
          const dateB = b.createdAt ? b.createdAt.seconds : 0;
          return dateB - dateA;
        });
        break;
      case 'oldest':
        result.sort((a, b) => {
          const dateA = a.createdAt ? a.createdAt.seconds : 0;
          const dateB = b.createdAt ? b.createdAt.seconds : 0;
          return dateA - dateB;
        });
        break;
      case 'name':
        result.sort((a, b) => {
          const nameA = a.displayName || '';
          const nameB = b.displayName || '';
          return nameA.localeCompare(nameB);
        });
        break;
      case 'email':
        result.sort((a, b) => {
          const emailA = a.email || '';
          const emailB = b.email || '';
          return emailA.localeCompare(emailB);
        });
        break;
      default:
        break;
    }
    
    setFilteredUsers(result);
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date()
      });
      
      // Mettre à jour l'état local
      setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === userId) {
          return { ...user, role: newRole };
        }
        return user;
      }));
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Erreur lors de la mise à jour du rôle de l\'utilisateur');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
      
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <div className="admin-users-list">
      <div className="admin-users-header">
        <div className="admin-navigation-buttons">
          <Link to="/admin" className="admin-back-button">
            <ArrowLeft size={18} />
            Retour au dashboard
          </Link>
          <Link to="/" className="admin-home-button">
            <Home size={18} />
            Retour au site
          </Link>
        </div>
        
        <h1>Gestion des utilisateurs</h1>
        <div className="admin-users-stats">
          <div className="admin-users-stat">
            <div className="admin-users-stat-value">{users.length}</div>
            <div className="admin-users-stat-label">Utilisateurs</div>
          </div>
          <div className="admin-users-stat">
            <div className="admin-users-stat-value">
              {users.filter(user => user.role === 'admin').length}
            </div>
            <div className="admin-users-stat-label">Administrateurs</div>
          </div>
          <div className="admin-users-stat">
            <div className="admin-users-stat-value">
              {users.filter(user => user.role === 'customer').length}
            </div>
            <div className="admin-users-stat-label">Clients</div>
          </div>
        </div>
      </div>

      <div className="admin-users-filters">
        <div className="admin-users-search">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="admin-filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filtres
          <ChevronDown 
            size={16} 
            className={`filter-chevron ${showFilters ? 'active' : ''}`} 
          />
        </button>
      </div>

      {showFilters && (
        <div className="admin-filters-panel">
          <div className="admin-filter-group">
            <label>Rôle</label>
            <div className="admin-filter-options">
              <button 
                className={`admin-filter-option ${filters.role === 'all' ? 'active' : ''}`}
                onClick={() => setFilters({...filters, role: 'all'})}
              >
                Tous
              </button>
              <button 
                className={`admin-filter-option ${filters.role === 'admin' ? 'active' : ''}`}
                onClick={() => setFilters({...filters, role: 'admin'})}
              >
                Administrateurs
              </button>
              <button 
                className={`admin-filter-option ${filters.role === 'customer' ? 'active' : ''}`}
                onClick={() => setFilters({...filters, role: 'customer'})}
              >
                Clients
              </button>
            </div>
          </div>
          <div className="admin-filter-group">
            <label>Trier par</label>
            <div className="admin-filter-options">
              <button 
                className={`admin-filter-option ${filters.sortBy === 'newest' ? 'active' : ''}`}
                onClick={() => setFilters({...filters, sortBy: 'newest'})}
              >
                Plus récents
              </button>
              <button 
                className={`admin-filter-option ${filters.sortBy === 'oldest' ? 'active' : ''}`}
                onClick={() => setFilters({...filters, sortBy: 'oldest'})}
              >
                Plus anciens
              </button>
              <button 
                className={`admin-filter-option ${filters.sortBy === 'name' ? 'active' : ''}`}
                onClick={() => setFilters({...filters, sortBy: 'name'})}
              >
                Nom
              </button>
              <button 
                className={`admin-filter-option ${filters.sortBy === 'email' ? 'active' : ''}`}
                onClick={() => setFilters({...filters, sortBy: 'email'})}
              >
                Email
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="admin-users-error">
          {error}
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="admin-users-empty">
          <Users size={48} />
          <h2>Aucun utilisateur trouvé</h2>
          <p>Aucun utilisateur ne correspond aux critères de recherche.</p>
        </div>
      ) : (
        <div className="admin-users-table-container">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Inscription</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} onClick={() => navigate(`/admin/users/${user.id}`)}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                      </div>
                      <div className="user-name">
                        {user.displayName || 'Utilisateur sans nom'}
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <select
                      className={`role-select ${user.role || 'customer'}`}
                      value={user.role || 'customer'}
                      onChange={(e) => {
                        e.stopPropagation(); // Empêcher la navigation
                        handleUpdateRole(user.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()} // Empêcher la navigation
                    >
                      <option value="customer">Client</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className="view-user-button"
                      onClick={(e) => {
                        e.stopPropagation(); // Empêcher la propagation du clic
                        navigate(`/admin/users/${user.id}`);
                      }}
                    >
                      Voir profil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersList;