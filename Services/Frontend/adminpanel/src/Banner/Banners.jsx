import React, { useState, useEffect } from 'react';
import { bannerApi } from '../api';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [dragOver, setDragOver] = useState({ image1: false, image2: false });
  const [uploadProgress, setUploadProgress] = useState({ image1: 0, image2: 0 });
  const [uploading, setUploading] = useState({ image1: false, image2: false });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching banners...');
      const response = await bannerApi.getAllBanners();
      console.log('Banners response:', response);
      
      // Handle different response structures
      const bannersData = response?.data || response || [];
      setBanners(Array.isArray(bannersData) ? bannersData : []);
      console.log('Banners set:', bannersData);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setError('Failed to fetch banners: ' + (error.response?.data?.message || error.message));
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files, imageField) => {
    if (!files || files.length === 0) return;

    setUploading(prev => ({ ...prev, [imageField]: true }));
    setUploadProgress(prev => ({ ...prev, [imageField]: 0 }));
    setError(null);

    try {
      console.log(`Uploading ${files.length} files to ${imageField}...`);

      // Validate file types
      const validFiles = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          console.warn(`Skipping large file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          return false;
    }
        return true;
      });

      if (validFiles.length === 0) {
        throw new Error('No valid image files selected. Please select image files under 10MB.');
      }

      const uploadPromises = validFiles.map(async (file, index) => {
        const fileName = `banners/${imageField}/${Date.now()}_${index}_${file.name}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(prev => ({ 
                ...prev, 
                [imageField]: Math.round(progress) 
              }));
              console.log(`Upload ${index + 1} progress: ${Math.round(progress)}%`);
            },
            (error) => {
              console.error(`Upload error for file ${file.name}:`, error);
              reject(new Error(`Failed to upload ${file.name}: ${error.message}`));
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log(`Upload completed for ${file.name}: ${downloadURL}`);
                resolve(downloadURL);
              } catch (error) {
                console.error(`Error getting download URL for ${file.name}:`, error);
                reject(new Error(`Failed to get download URL for ${file.name}`));
              }
            }
          );
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      console.log('All uploads completed:', uploadedUrls);

      // Create banner with single image array
      const bannerData = {
        images: uploadedUrls,
        imageField: imageField
      };

      console.log('Creating banner with data:', bannerData);
      const createResponse = await bannerApi.createBannerWithSingleImage(bannerData);
      console.log('Banner created:', createResponse);

      alert(`✅ Successfully uploaded ${uploadedUrls.length} images to ${imageField}!`);
      await fetchBanners();
    } catch (error) {
      console.error('Error uploading images:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      setError(`Upload failed: ${errorMessage}`);
      alert(`❌ Upload failed: ${errorMessage}`);
    } finally {
      setUploading(prev => ({ ...prev, [imageField]: false }));
      setUploadProgress(prev => ({ ...prev, [imageField]: 0 }));
    }
  };

  const handleDrop = (e, imageField) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [imageField]: false }));
    const files = e.dataTransfer.files;
    handleFileUpload(files, imageField);
  };

  const handleDragOver = (e, imageField) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [imageField]: true }));
  };

  const handleDragLeave = (e, imageField) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [imageField]: false }));
  };

  const handleFileInput = (e, imageField) => {
    e.stopPropagation(); // Prevent event bubbling
    const files = e.target.files;
    handleFileUpload(files, imageField);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleUploadAreaClick = (inputId) => {
    document.getElementById(inputId).click();
  };

  const addImageToArray = async (bannerId, imageField) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const files = e.target.files;
      if (files.length === 0) return;

    try {
        setLoading(true);
        setError(null);

        const validFiles = Array.from(files).filter(file => {
          return file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024;
        });

        if (validFiles.length === 0) {
          throw new Error('No valid image files selected');
        }

        const uploadPromises = validFiles.map(async (file, index) => {
          const fileName = `banners/${imageField}/${Date.now()}_add_${index}_${file.name}`;
          const storageRef = ref(storage, fileName);
          const uploadTask = uploadBytesResumable(storageRef, file);

          return new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Add image progress: ${Math.round(progress)}%`);
              },
              (error) => reject(error),
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              }
            );
          });
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        await bannerApi.addImagesToArray(bannerId, imageField, { images: uploadedUrls });
        alert(`✅ Successfully added ${uploadedUrls.length} images!`);
        await fetchBanners();
      } catch (error) {
        console.error('Error adding images:', error);
        const errorMessage = error.response?.data?.message || error.message;
        setError(`Failed to add images: ${errorMessage}`);
        alert(`❌ Failed to add images: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    
    input.click();
  };

  const updateImageArray = async (bannerId, imageField) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const files = e.target.files;
      if (files.length === 0) return;

      try {
        setLoading(true);
        setError(null);

        const validFiles = Array.from(files).filter(file => {
          return file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024;
        });

        if (validFiles.length === 0) {
          throw new Error('No valid image files selected');
        }

        const uploadPromises = validFiles.map(async (file, index) => {
          const fileName = `banners/${imageField}/${Date.now()}_update_${index}_${file.name}`;
          const storageRef = ref(storage, fileName);
          const uploadTask = uploadBytesResumable(storageRef, file);

          return new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Update progress: ${Math.round(progress)}%`);
              },
              (error) => reject(error),
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              }
            );
          });
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        await bannerApi.updateImageArray(bannerId, imageField, { images: uploadedUrls });
        alert(`✅ Successfully updated ${imageField} array with ${uploadedUrls.length} images!`);
        await fetchBanners();
      } catch (error) {
        console.error('Error updating image array:', error);
        const errorMessage = error.response?.data?.message || error.message;
        setError(`Failed to update images: ${errorMessage}`);
        alert(`❌ Failed to update images: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    
    input.click();
  };

  const deleteImageFromArray = async (bannerId, imageField, imageIndex) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        setLoading(true);
        setError(null);
        await bannerApi.deleteImageFromArray(bannerId, imageField, imageIndex);
        alert('✅ Image deleted successfully!');
        await fetchBanners();
      } catch (error) {
        console.error('Error deleting image:', error);
        const errorMessage = error.response?.data?.message || error.message;
        setError(`Failed to delete image: ${errorMessage}`);
        alert(`❌ Failed to delete image: ${errorMessage}`);
    } finally {
        setLoading(false);
      }
    }
  };

  const deleteBanner = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        setLoading(true);
        setError(null);
        await bannerApi.deleteBanner(bannerId);
        alert('✅ Banner deleted successfully!');
        await fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        const errorMessage = error.response?.data?.message || error.message;
        setError(`Failed to delete banner: ${errorMessage}`);
        alert(`❌ Failed to delete banner: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteAllBanners = async () => {
    if (window.confirm('Are you sure you want to delete ALL banners? This action cannot be undone.')) {
      try {
        setLoading(true);
        setError(null);
        await bannerApi.deleteAllBanners();
        alert('✅ All banners deleted successfully!');
        await fetchBanners();
      } catch (error) {
        console.error('Error deleting all banners:', error);
        const errorMessage = error.response?.data?.message || error.message;
        setError(`Failed to delete all banners: ${errorMessage}`);
        alert(`❌ Failed to delete all banners: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderImageArray = (images, bannerId, imageField) => {
    // Ensure images is an array
    const imageArray = Array.isArray(images) ? images : [];
    
    return (
      <div style={styles.imageArraySection}>
        <h4 style={styles.imageFieldTitle}>
          {imageField === 'image1' ? 'Image Array 1' : 'Image Array 2'}
          <span style={styles.imageCount}>({imageArray.length} images)</span>
        </h4>
        
        <div style={styles.imageArrayActions}>
          <button
            onClick={() => addImageToArray(bannerId, imageField)}
            style={{...styles.button, ...styles.buttonSuccess}}
            disabled={loading}
          >
            Add Images
          </button>
          <button
            onClick={() => updateImageArray(bannerId, imageField)}
            style={{...styles.button, ...styles.buttonWarning}}
            disabled={loading}
          >
            Replace All
          </button>
        </div>

        <div style={styles.imagesGrid}>
          {imageArray.map((image, index) => (
            <div key={index} style={styles.imageItem}>
              <img 
                src={image} 
                alt={`${imageField} ${index + 1}`} 
                style={styles.bannerImagePreview}
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.error(`Failed to load image: ${image}`);
                }}
                onLoad={() => console.log(`Image loaded: ${image}`)}
              />
              <button
                onClick={() => deleteImageFromArray(bannerId, imageField, index)}
                style={{...styles.button, ...styles.buttonDanger, ...styles.deleteImageBtn}}
                disabled={loading}
                title="Delete this image"
              >
                ×
              </button>
            </div>
          ))}
          {imageArray.length === 0 && (
            <div style={styles.noImages}>
              <p>No images in this array</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.bannersContainer}>
      <div style={styles.bannerHeader}>
        <h2>Banner Management</h2>
        <div style={styles.tabNavigation}>
          <button 
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'upload' ? styles.tabBtnActive : {})
            }}
            onClick={() => setActiveTab('upload')}
          >
            Upload Images
          </button>
          <button 
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'manage' ? styles.tabBtnActive : {})
            }}
            onClick={() => setActiveTab('manage')}
          >
            Manage Banners
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorMessage}>
          <strong>Error:</strong> {error}
                    <button
            onClick={() => setError(null)} 
            style={styles.closeError}
          >
            ×
                    </button>
                  </div>
      )}

      {/* Loading Indicator */}
      {loading && <div style={styles.loadingSpinner}>Loading...</div>}

      {activeTab === 'upload' && (
        <div style={styles.uploadSection}>
          <h3 style={styles.sectionTitle}>Upload New Images</h3>
          
          {/* Image Array 1 Upload */}
          <div style={styles.uploadAreaContainer}>
            <h4>Upload to Image Array 1</h4>
            <div 
              style={{
                ...styles.uploadArea,
                ...(dragOver.image1 ? styles.dragOver : {}),
                ...(uploading.image1 ? styles.uploading : {})
              }}
              onDrop={(e) => handleDrop(e, 'image1')}
              onDragOver={(e) => handleDragOver(e, 'image1')}
              onDragLeave={(e) => handleDragLeave(e, 'image1')}
              onClick={() => !uploading.image1 && handleUploadAreaClick('file-input-1')}
            >
              <div style={styles.uploadContent}>
                {uploading.image1 ? (
                  <>
                    <div style={styles.uploadingIcon}>⏳</div>
                    <p style={styles.uploadingText}>Uploading images...</p>
                  </>
                ) : (
                  <>
                    <div style={styles.uploadIcon}>📁</div>
                    <p style={styles.uploadText}>Drag and drop images here or click to select</p>
                    <p style={styles.uploadSubtext}>Supports JPG, PNG, GIF, WebP • Max 10MB per file</p>
                  </>
                )}
                <input
                  id="file-input-1"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileInput(e, 'image1')}
                  style={styles.fileInput}
                  disabled={uploading.image1}
                />
              </div>
              {uploading.image1 && (
                <div style={styles.uploadProgress}>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${uploadProgress.image1}%`
                      }}
                    ></div>
                  </div>
                  <span style={styles.progressText}>{uploadProgress.image1}%</span>
                </div>
              )}
            </div>
                    </div>

          {/* Image Array 2 Upload */}
          <div style={styles.uploadAreaContainer}>
            <h4>Upload to Image Array 2</h4>
            <div 
              style={{
                ...styles.uploadArea,
                ...(dragOver.image2 ? styles.dragOver : {}),
                ...(uploading.image2 ? styles.uploading : {})
              }}
              onDrop={(e) => handleDrop(e, 'image2')}
              onDragOver={(e) => handleDragOver(e, 'image2')}
              onDragLeave={(e) => handleDragLeave(e, 'image2')}
              onClick={() => !uploading.image2 && handleUploadAreaClick('file-input-2')}
            >
              <div style={styles.uploadContent}>
                {uploading.image2 ? (
                  <>
                    <div style={styles.uploadingIcon}>⏳</div>
                    <p style={styles.uploadingText}>Uploading images...</p>
                  </>
                ) : (
                  <>
                    <div style={styles.uploadIcon}>📁</div>
                    <p style={styles.uploadText}>Drag and drop images here or click to select</p>
                    <p style={styles.uploadSubtext}>Supports JPG, PNG, GIF, WebP • Max 10MB per file</p>
                  </>
                )}
                <input
                  id="file-input-2"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileInput(e, 'image2')}
                  style={styles.fileInput}
                  disabled={uploading.image2}
                />
              </div>
              {uploading.image2 && (
                <div style={styles.uploadProgress}>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${uploadProgress.image2}%`
                      }}
                    ></div>
                  </div>
                  <span style={styles.progressText}>{uploadProgress.image2}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div style={styles.manageSection}>
          <div style={styles.manageHeader}>
            <h3>Existing Banners ({banners.length})</h3>
            <div style={styles.headerActions}>
              <button 
                onClick={fetchBanners}
                style={{...styles.button, ...styles.buttonPrimary}}
                disabled={loading}
              >
                🔄 Refresh
              </button>
              {banners.length > 0 && (
                <button 
                  onClick={deleteAllBanners}
                  style={{...styles.button, ...styles.buttonDanger}}
                  disabled={loading}
                >
                  🗑️ Delete All
                </button>
              )}
            </div>
          </div>

          {banners.length === 0 ? (
            <div style={styles.noBanners}>
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📸</div>
                <h4>No banners found</h4>
                <p>Upload some images to get started!</p>
          <button
                  onClick={() => setActiveTab('upload')}
                  style={{...styles.button, ...styles.buttonPrimary}}
          >
                  Upload Images
          </button>
      </div>
          </div>
        ) : (
            <div style={styles.bannersList}>
            {banners.map((banner) => (
                <div key={banner.id} style={styles.bannerCard}>
                  <div style={styles.bannerInfo}>
                    <p><strong>Banner ID:</strong> {banner.id}</p>
                    <p><strong>Created:</strong> {new Date(banner.createdAt).toLocaleDateString()}</p>
                    {banner.updatedAt && (
                      <p><strong>Updated:</strong> {new Date(banner.updatedAt).toLocaleDateString()}</p>
                    )}
                  </div>

                  <div style={styles.bannerImages}>
                    {/* Image Array 1 */}
                    {renderImageArray(banner.image1, banner.id, 'image1')}
                    
                    {/* Image Array 2 */}
                    {renderImageArray(banner.image2, banner.id, 'image2')}
                </div>

                  <div style={styles.bannerActions}>
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      style={{...styles.button, ...styles.buttonDanger}}
                      disabled={loading}
                    >
                      🗑️ Delete Banner
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

// Enhanced inline styles
const styles = {
  bannersContainer: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    minHeight: '100vh'
  },
  bannerHeader: {
    marginBottom: '30px',
    background: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.8)'
  },
  tabNavigation: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  tabBtn: {
    padding: '12px 24px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  tabBtnActive: {
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeError: {
    background: 'none',
    border: 'none',
    color: '#721c24',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '0 8px'
  },
  loadingSpinner: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#666'
  },
  uploadSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    border: '1px solid rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '30px',
    textAlign: 'center'
  },
  uploadInfo: {
    color: '#666',
    marginBottom: '30px',
    fontSize: '14px'
  },
  uploadAreaContainer: {
    marginBottom: '40px'
  },
  uploadArea: {
    border: '2px dashed #ddd',
    borderRadius: '16px',
    padding: '60px 40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    backgroundColor: '#fafafa',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    ':hover': {
      borderColor: '#007bff',
      backgroundColor: '#f0f8ff',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,123,255,0.15)'
    }
  },
  dragOver: {
    borderColor: '#007bff',
    backgroundColor: '#f0f8ff',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    transform: 'scale(1.02)',
    boxShadow: '0 8px 24px rgba(0,123,255,0.2)'
  },
  uploading: {
    borderColor: '#28a745',
    backgroundColor: '#f8fff9',
    background: 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)',
    cursor: 'not-allowed',
    pointerEvents: 'none'
  },
  uploadContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  uploadIcon: {
    fontSize: '64px',
    marginBottom: '10px',
    opacity: '0.8'
  },
  uploadingIcon: {
    fontSize: '64px',
    marginBottom: '10px',
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  uploadText: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#333',
    margin: '0 0 8px 0'
  },
  uploadSubtext: {
    fontSize: '14px',
    color: '#666',
    margin: '0'
  },
  uploadingText: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#28a745',
    margin: '0'
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    cursor: 'pointer'
  },
  uploadProgress: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '0 20px'
  },
  progressBar: {
    flex: 1,
    height: '12px',
    backgroundColor: '#e9ecef',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #007bff 0%, #0056b3 100%)',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0,123,255,0.3)'
  },
  progressText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#007bff',
    minWidth: '45px',
    textAlign: 'right'
  },
  manageSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    border: '1px solid rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)'
  },
  manageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  headerActions: {
    display: 'flex',
    gap: '10px'
  },
  noBanners: {
    textAlign: 'center',
    padding: '60px 40px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
  },
  emptyIcon: {
    fontSize: '64px'
  },
  bannersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  bannerCard: {
    border: '1px solid rgba(224, 224, 224, 0.5)',
    borderRadius: '16px',
    padding: '25px',
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
    }
  },
  bannerInfo: {
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '8px'
  },
  bannerImages: {
    marginBottom: '25px'
  },
  bannerActions: {
    display: 'flex',
    gap: '10px'
  },
  imageArraySection: {
    marginBottom: '25px',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    backgroundColor: 'white'
  },
  imageFieldTitle: {
    margin: '0 0 15px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: '600'
  },
  imageCount: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 'normal'
  },
  imageArrayActions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  imagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '15px'
  },
  imageItem: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ':hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    }
  },
  bannerImagePreview: {
    width: '100%',
    height: '120px',
    objectFit: 'cover'
  },
  deleteImageBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    padding: '0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  noImages: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontStyle: 'italic'
  },
  button: {
    padding: '12px 24px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8f9fa',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    ':active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
    }
  },
  buttonPrimary: {
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff'
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
    color: 'white',
    borderColor: '#28a745'
  },
  buttonWarning: {
    backgroundColor: '#ffc107',
    color: '#212529',
    borderColor: '#ffc107'
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
    color: 'white',
    borderColor: '#dc3545'
  }
};

export default Banners; 
