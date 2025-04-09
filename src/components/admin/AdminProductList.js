import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash, Search } from 'lucide-react';
import { getAllProducts, deleteProduct } from '../../firebase/products';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const result = await getAllProducts();
      if (result.success) {
        setProducts(result.products);
        setFilteredProducts(result.products);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Filtrer les produits en fonction du terme de recherche
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const result = await deleteProduct(id);
      if (result.success) {
        setProducts(products.filter(product => product.id !== id));
      } else {
        alert(`Erreur: ${result.error}`);
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Gestion des produits</h1>
        <div className="admin-actions">
          <Link to="/admin/add-product" className="admin-button">
            Ajouter un produit
          </Link>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search style={{ position: 'absolute', left: '0.8rem', color: '#888' }} size={20} />
        </div>

        {loading ? (
          <p>Chargement des produits...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Nom</th>
                  <th>Prix</th>
                  <th>Catégories</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <img 
                          src={product.imageUrls && product.imageUrls.length > 0 
                            ? product.imageUrls[0] 
                            : '/api/placeholder/60/60'} 
                          alt={product.name} 
                          className="admin-product-image" 
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.price.toFixed(2)} €</td>
                      <td>{product.categories.join(', ')}</td>
                      <td>
                        <div className="admin-product-actions">
                          <Link 
                            to={`/admin/edit-product/${product.id}`} 
                            className="admin-button admin-button-secondary"
                            style={{ padding: '0.4rem 0.8rem' }}
                          >
                            <Edit size={16} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            className="admin-button admin-button-secondary"
                            style={{ padding: '0.4rem 0.8rem', color: 'red' }}
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductList;