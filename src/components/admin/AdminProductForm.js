import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';
import { addProduct, getProductById, updateProduct } from '../../firebase/products';
import { SUBCATEGORIES } from '../../utils/categories';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    badge: '',
    categories: [],
    subcategories: []
  });
  
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  
  const categoryOptions = [
    { value: 'home', label: 'Page d\'accueil' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'retro', label: 'Retro' },
    { value: 'tcg', label: 'TCG' },
    { value: 'goodies', label: 'Goodies' }
  ];
  
  const badgeOptions = [
    { value: '', label: 'Aucun' },
    { value: 'Nouveau', label: 'Nouveau' },
    { value: 'Promo', label: 'Promo' },
    { value: 'Populaire', label: 'Populaire' },
    { value: 'Stock limité', label: 'Stock limité' },
    { value: 'Rare', label: 'Rare' },
    { value: 'Collector', label: 'Collector' },
    { value: 'Edition limitée', label: 'Edition limitée' },
    { value: 'Classique', label: 'Classique' },
    { value: 'Retro', label: 'Retro' }
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      if (isEditMode) {
        const result = await getProductById(id);
        if (result.success) {
          const product = result.product;
          setFormData({
            name: product.name || '',
            price: product.price || '',
            description: product.description || '',
            stock: product.stock || '',
            badge: product.badge || '',
            categories: product.categories || [],
            subcategories: product.subcategories || []
          });
          
          // Récupérer les images existantes
          if (product.imageUrls && product.imageUrls.length > 0) {
            setExistingImages(product.imageUrls);
          }
        } else {
          setError('Produit non trouvé');
        }
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        categories: [...formData.categories, value]
      });
    } else {
      setFormData({
        ...formData,
        categories: formData.categories.filter(category => category !== value),
        // Supprimer également les sous-catégories associées à cette catégorie
        subcategories: formData.subcategories.filter(subcatId => {
          // Pour chaque sous-catégorie, vérifier si elle appartient à la catégorie supprimée
          // Ou si c'est une sous-sous-catégorie appartenant à une sous-catégorie de la catégorie supprimée
          let belongsToCategory = false;
          
          // Vérifier les sous-catégories directes
          if (SUBCATEGORIES[value]) {
            belongsToCategory = SUBCATEGORIES[value].some(subcat => subcat.id === subcatId);
            
            // Vérifier les sous-sous-catégories
            if (!belongsToCategory) {
              SUBCATEGORIES[value].forEach(mainSubcat => {
                if (mainSubcat.subCategories) {
                  belongsToCategory = belongsToCategory || mainSubcat.subCategories.some(nestedSub => nestedSub.id === subcatId);
                }
              });
            }
          }
          
          return !belongsToCategory;
        })
      });
    }
  };

  const handleSubcategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        subcategories: [...formData.subcategories, value]
      });
    } else {
      // Supprimer la sous-catégorie et toutes ses sous-sous-catégories si elle en a
      const categoryWithSubcats = Object.values(SUBCATEGORIES)
        .flatMap(cats => cats)
        .find(cat => cat.id === value && cat.subCategories);
        
      if (categoryWithSubcats && categoryWithSubcats.subCategories) {
        // C'est une sous-catégorie principale avec des sous-sous-catégories
        const nestedSubcatIds = categoryWithSubcats.subCategories.map(sub => sub.id);
        
        setFormData({
          ...formData,
          subcategories: formData.subcategories.filter(
            subcatId => subcatId !== value && !nestedSubcatIds.includes(subcatId)
          )
        });
      } else {
        // C'est une sous-catégorie simple ou une sous-sous-catégorie
        setFormData({
          ...formData,
          subcategories: formData.subcategories.filter(subcatId => subcatId !== value)
        });
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
    
    // Prévisualisation des images
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prevImages => [...prevImages, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (formData.categories.length === 0) {
      setError('Veuillez sélectionner au moins une catégorie');
      return;
    }
    
    if (!isEditMode && imageFiles.length === 0) {
      setError('Veuillez ajouter au moins une image');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        stock: parseInt(formData.stock) || 0,
        badge: formData.badge,
        categories: formData.categories,
        subcategories: formData.subcategories
      };
      
      let result;
      
      if (isEditMode) {
        // Mise à jour du produit existant
        productData.imageUrls = existingImages; // Conserver les images existantes restantes
        result = await updateProduct(id, productData, imageFiles);
      } else {
        // Création d'un nouveau produit
        result = await addProduct(productData, imageFiles);
      }
      
      if (result.success) {
        navigate('/admin/products');
      } else {
        setError(result.error || 'Une erreur est survenue');
      }
    } catch (error) {
      setError('Une erreur est survenue');
      console.error(error);
    }
    
    setLoading(false);
  };

  if (loading && isEditMode) {
    return <div>Chargement du produit...</div>;
  }

  // Fonction pour générer les cases à cocher des sous-catégories
  const renderSubcategories = (categoryType) => {
    if (!SUBCATEGORIES[categoryType]) return null;
    
    return (
      <div className="admin-subcategory-section" key={categoryType}>
        <h4 className="subcategory-title">{categoryType.charAt(0).toUpperCase() + categoryType.slice(1)}</h4>
        <div className="admin-subcategory-checkboxes">
          {SUBCATEGORIES[categoryType].map(subcategory => {
            const isMainSubcat = subcategory.subCategories && subcategory.subCategories.length > 0;
            
            return (
              <div key={subcategory.id} className="admin-category-checkbox">
                <input
                  type="checkbox"
                  id={`subcategory-${subcategory.id}`}
                  value={subcategory.id}
                  checked={formData.subcategories.includes(subcategory.id)}
                  onChange={handleSubcategoryChange}
                  disabled={!formData.categories.includes(categoryType)}
                />
                <label htmlFor={`subcategory-${subcategory.id}`}>
                  {subcategory.name}
                  {isMainSubcat && ' *'}
                </label>
                
                {/* Afficher les sous-sous-catégories (pour TCG) */}
                {isMainSubcat && formData.subcategories.includes(subcategory.id) && (
                  <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
                      Sous-catégories de {subcategory.name}:
                    </div>
                    <div className="admin-subcategory-checkboxes" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      {subcategory.subCategories.map(nestedSub => (
                        <div key={nestedSub.id} className="admin-category-checkbox">
                          <input
                            type="checkbox"
                            id={`subcategory-${nestedSub.id}`}
                            value={nestedSub.id}
                            checked={formData.subcategories.includes(nestedSub.id)}
                            onChange={handleSubcategoryChange}
                          />
                          <label htmlFor={`subcategory-${nestedSub.id}`}>
                            {nestedSub.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="admin-header">
        <h1>{isEditMode ? 'Modifier le produit' : 'Ajouter un produit'}</h1>
        <div className="admin-actions">
          <button 
            className="admin-button admin-button-secondary"
            onClick={() => navigate('/admin/products')}
          >
            <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
            Retour
          </button>
        </div>
      </div>
      
      <div className="admin-card">
        {error && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="name">Nom du produit *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="price">Prix (€) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="stock">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="badge">Badge</label>
            <select
              id="badge"
              name="badge"
              value={formData.badge}
              onChange={handleChange}
            >
              {badgeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="admin-form-group">
            <label>Catégories principales *</label>
            <div className="admin-category-checkboxes">
              {categoryOptions.map(option => (
                <div key={option.value} className="admin-category-checkbox">
                  <input
                    type="checkbox"
                    id={`category-${option.value}`}
                    value={option.value}
                    checked={formData.categories.includes(option.value)}
                    onChange={handleCategoryChange}
                  />
                  <label htmlFor={`category-${option.value}`}>{option.label}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Section des sous-catégories */}
          <div className="admin-form-group">
            <label>Sous-catégories</label>
            <p className="subcategory-help">
              Sélectionnez d'abord une catégorie principale pour voir ses sous-catégories. 
              Les entrées marquées d'un astérisque (*) contiennent des sous-catégories supplémentaires.
            </p>
            
            <div className="admin-subcategories-container">
              {formData.categories.map(category => {
                if (category === 'home') return null; // La page d'accueil n'a pas de sous-catégories
                return renderSubcategories(category);
              })}
            </div>
          </div>
          
          <div className="admin-form-group">
            <label>Images *</label>
            <label htmlFor="images" className="admin-image-upload">
              <Upload size={24} style={{ marginBottom: '0.5rem' }} />
              <div>Cliquez ou glissez-déposez pour télécharger des images</div>
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
            
            {/* Afficher les nouvelles images */}
            {images.length > 0 && (
              <div>
                <label>Nouvelles images</label>
                <div className="admin-image-preview">
                  {images.map((image, index) => (
                    <div key={index} className="admin-image-preview-item">
                      <img src={image} alt={`Aperçu ${index}`} />
                      <div 
                        className="admin-image-preview-remove"
                        onClick={() => removeImage(index)}
                      >
                        <X size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Afficher les images existantes (mode édition) */}
            {existingImages.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <label>Images existantes</label>
                <div className="admin-image-preview">
                  {existingImages.map((image, index) => (
                    <div key={index} className="admin-image-preview-item">
                      <img src={image} alt={`Image ${index}`} />
                      <div 
                        className="admin-image-preview-remove"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button type="submit" className="admin-button" disabled={loading}>
            <Save size={18} style={{ marginRight: '0.5rem' }} />
            {loading 
              ? (isEditMode ? 'Mise à jour...' : 'Création...') 
              : (isEditMode ? 'Mettre à jour' : 'Créer le produit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;