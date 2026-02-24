/**
 * Admin Catalog Management Page
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus, Trash2, Edit2, LogOut, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface CatalogItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AdminCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadItems();
  }, [token, navigate]);

  const loadItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setItems(data.data);
      } else {
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          navigate('/admin/login');
        } else {
          setError(data.error || 'Fout bij laden items');
        }
      }
    } catch (err) {
      setError('Verbindingsfout');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit item wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        loadItems();
      } else {
        setError(data.error || 'Fout bij verwijderen');
      }
    } catch (err) {
      setError('Verbindingsfout');
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploading(true);
    setError('');
    
    try {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(`Bestand is te groot. Maximum grootte is ${(maxSize / 1024 / 1024).toFixed(0)}MB.`);
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Alleen afbeeldingen zijn toegestaan (jpeg, jpg, png, webp, gif)');
      }

      const formData = new FormData();
      formData.append('image', file);

      console.log(`📤 Uploading file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

      const response = await fetch(`${API_BASE_URL}/api/catalog/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Upload successful: ${data.data.imageUrl}`);
        return data.data.imageUrl;
      } else {
        throw new Error(data.error || 'Upload mislukt');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload mislukt';
      setError(errorMessage);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;
    const order = parseInt(formData.get('order') as string) || 0;
    const isActive = formData.get('isActive') === 'on';

    let imageUrl = editingItem?.imageUrl || '';

    // Upload new image if provided
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await handleImageUpload(imageFile);
      } catch (error) {
        // Error already set in handleImageUpload
        return;
      }
    }

    // Validate imageUrl is set for new items
    if (!imageUrl && !editingItem) {
      setError('Afbeelding is verplicht');
      return;
    }

    try {
      const url = editingItem
        ? `${API_BASE_URL}/api/catalog/${editingItem.id}`
        : `${API_BASE_URL}/api/catalog`;

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || null,
          imageUrl,
          order,
          isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingItem(null);
        loadItems();
        (e.target as HTMLFormElement).reset();
      } else {
        setError(data.error || 'Fout bij opslaan');
      }
    } catch (err) {
      setError('Verbindingsfout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary font-serif">Catalogus Beheer</h1>
            <p className="text-gray-600 mt-1">Beheer poederlak catalogus items</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Uitloggen
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <Button onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuw Item
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle className="text-primary">
                {editingItem ? 'Item Bewerken' : 'Nieuw Item'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titel *</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={editingItem?.title}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Volgorde</Label>
                    <Input
                      id="order"
                      name="order"
                      type="number"
                      defaultValue={editingItem?.order || 0}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving</Label>
                  <Input
                    id="description"
                    name="description"
                    defaultValue={editingItem?.description || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Afbeelding {!editingItem && '*'}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      required={!editingItem}
                      disabled={uploading}
                      className="flex-1"
                    />
                    {uploading && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Toegestane formaten: JPEG, PNG, WebP, GIF (max. 10MB)
                  </p>
                  {editingItem && editingItem.imageUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">Huidige afbeelding:</p>
                      <img
                        src={editingItem.imageUrl.startsWith('http') ? editingItem.imageUrl : `${API_BASE_URL}${editingItem.imageUrl}`}
                        alt={editingItem.title}
                        className="w-32 h-32 object-cover border border-gray-200 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-400 mt-1 break-all">{editingItem.imageUrl}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    defaultChecked={editingItem?.isActive !== false}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Actief</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploaden...
                      </>
                    ) : (
                      editingItem ? 'Bijwerken' : 'Toevoegen'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      setError('');
                    }}
                    disabled={uploading}
                  >
                    Annuleren
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="border">
              <div className="aspect-square overflow-hidden bg-gray-100 relative">
                {item.imageUrl ? (
                  <>
                    <img
                      src={item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE_URL}${item.imageUrl}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                              <div class="text-center p-4">
                                <div class="text-4xl mb-2">📷</div>
                                <div class="text-sm font-medium">Afbeelding niet gevonden</div>
                                <div class="text-xs mt-2 text-gray-300 break-all px-2">${item.imageUrl}</div>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm">Geen afbeelding</div>
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.isActive ? 'Actief' : 'Inactief'}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingItem(item);
                        setShowForm(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {items.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Geen items gevonden. Voeg een nieuw item toe om te beginnen.
          </div>
        )}
      </div>
    </div>
  );
}
