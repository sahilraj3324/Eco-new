import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api'; // Updated to use default import
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ViewSubcategoriesPage() {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCategoryDetails = async () => {
    try {
      setLoadingCategory(true);
      const data = await api.category.getById(categoryId);
      setCategory(data);
    } catch (err) {
      setError(`Failed to load category details: ${err.message || 'Unknown error'}`);
      setCategory(null);
    } finally {
      setLoadingCategory(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const data = await api.subCategory.getByCategoryId(categoryId);
      setSubcategories(Array.isArray(data) ? data : []); // Ensure data is an array
      setError(null);
    } catch (err) {
      // Backend returns 404 if no subcategories, which is not strictly an error for display
      if (err.response && err.response.status === 404) {
        setSubcategories([]); 
        setError(null); // Clear previous errors
      } else {
        setError(`Failed to load subcategories: ${err.message || 'Unknown error'}`);
        setSubcategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategoryDetails();
      fetchSubcategories();
    }
  }, [categoryId]);

  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) {
      setError('Subcategory name cannot be empty.');
      return;
    }
    try {
      setLoading(true); // Or a specific loading state for creation
      await api.subCategory.create({ 
        subCategoryName: newSubcategoryName, 
        categoryId: categoryId 
      });
      setNewSubcategoryName('');
      setSuccessMessage('Subcategory created successfully!');
      fetchSubcategories(); // Refresh the list
      setError(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Failed to create subcategory: ${err.message || 'Unknown error'}`);
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategory || (loading && subcategories.length === 0 && !category)) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link 
          to="/categories" 
          className="inline-flex items-center text-sm font-medium text-cyan-600 hover:text-cyan-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Categories
        </Link>
        {category ? (
          <h1 className="text-2xl font-semibold text-gray-800">
            Subcategories for: <span className="text-cyan-700">{category.categoryName}</span>
          </h1>
        ) : loadingCategory ? (
            <h1 className="text-2xl font-semibold text-gray-800">Loading category...</h1>
        ) : (
            <h1 className="text-2xl font-semibold text-gray-800">Subcategories</h1>
        )
        }
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">{successMessage}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 rounded-md bg-white p-6 shadow">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Add New Subcategory</h2>
        <form onSubmit={handleCreateSubcategory} className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-grow">
            <label htmlFor="newSubcategoryName" className="block text-sm font-medium text-gray-700">
              Subcategory Name
            </label>
            <input
              type="text"
              id="newSubcategoryName"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              placeholder="Enter subcategory name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading} // Consider a more specific loading state
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Subcategory
          </button>
        </form>
      </div>

      <div className="rounded-md bg-white p-6 shadow">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Existing Subcategories</h2>
        {loading && subcategories.length === 0 ? (
          <p className="text-gray-500">Loading subcategories...</p>
        ) : !loading && subcategories.length === 0 ? (
          <p className="text-gray-500">No subcategories found for this category. Add one above!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Subcategory Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ID
                  </th>
                  {/* Add more columns like actions if needed in future */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {subcategories.map((subcategory) => (
                  <tr key={subcategory.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {subcategory.subCategoryName} { /* Ensure this matches the backend response property */}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {subcategory.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 