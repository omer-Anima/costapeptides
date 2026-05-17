"use client";

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Lock, LayoutDashboard, ListFilter, Plus, Trash2, 
  Save, Upload, Share2, Clipboard, LogOut, Check, 
  AlertCircle, ChevronRight, MessageSquare, Database 
} from 'lucide-react';

const EXCHANGE_RATE = 454.48;

const CATEGORY_TRANSLATIONS = {
  'Weight Loss & Metabolism': 'Pérdida de peso y metabolismo',
  'Exercise Mimetic & Metabolic Modulator': 'Exercise Mimetic & Metabolic Modulator',
  'Recovery & Healing': 'Recuperación y curación',
  'Anti-Inflammatory': 'Antiinflamatorio',
  'Performance & Hormones': 'Rendimiento y hormonas',
  'Anti-Aging & Longevity': 'Antienvejecimiento y longevidad',
  'Immune System Modulation': 'Modulación del sistema inmunitario',
  'Cognitive & Mood': 'Cognitivo y estado de ánimo',
  'Sleep': 'Dormir',
  'Sexual Health': 'Salud sexual',
  'Tanning & Sexual Function': 'Bronceado y función sexual',
  'Skin & Hair': 'Piel y cabello',
  'Immune & Antioxidant': 'Sistema inmunitario y antioxidante',
  'Reconstitution Supply': 'Suministro de reconstitución'
};

export default function AdminPage() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Mounted state for hydration fix
  const [mounted, setMounted] = useState(false);

  // Dashboard state tabs: 'spreadsheet', 'orders', 'share'
  const [activeTab, setActiveTab] = useState('spreadsheet');

  // Spreadsheet product editor states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);
  
  // CSV Import States
  const [csvDragActive, setCsvDragActive] = useState(false);
  const [csvStatus, setCsvStatus] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);

  // Operation statuses
  const [saveStatus, setSaveStatus] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Link share builder states
  const [shareLang, setShareLang] = useState('es');
  const [shareCurrency, setShareCurrency] = useState('CRC');
  const [shareCopied, setShareCopied] = useState(false);

  // Auth session check on mount
  useEffect(() => {
    setMounted(true);
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAuthenticated(true);
          loadAdminData();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setIsAuthenticated(true);
          loadAdminData();
        } else {
          setIsAuthenticated(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // If Supabase is not configured, we allow full frontend simulation
      console.log("Supabase not fully configured. Running in Local Simulation Mode.");
    }
  }, []);

  // Fetch admin products and orders
  const loadAdminData = async () => {
    setLoadingProducts(true);
    setLoadingOrders(true);
    let loadedProducts = [];

    // 1. Fetch Products
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('priority', { ascending: true });

        if (!error && data) {
          loadedProducts = data.map(item => ({
            id: item.id,
            product: item.product || '',
            category: item.category || '',
            priceUsd: item.price_usd || '',
            priceCrc: item.price_crc || '',
            discount: item.discount || '',
            status: item.status || 'In Stock',
            coa: item.coa || '',
            imageUrl: item.image_url || '',
            priority: item.priority || 0
          }));
          setIsDbConnected(true);
        }
      } catch (err) {
        console.error("Failed to load products from database:", err);
      }
    }

    // Fallback to local CSV products if database is empty or not configured
    if (loadedProducts.length === 0) {
      try {
        const response = await fetch('/master_sheet.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            const lines = results.data;
            const headerIndex = lines.findIndex(l => l.some(cell => cell && cell.toLowerCase().includes('product')));
            
            if (headerIndex !== -1) {
              const headers = lines[headerIndex].map(h => h.toLowerCase().trim());
              const dataLines = lines.slice(headerIndex + 1);

              const parsed = dataLines
                .filter(line => line[0])
                .map((line, idx) => {
                  const p = {};
                  headers.forEach((h, i) => {
                    const key = h.replace(/\s+/g, '');
                    if (key.includes('product') || key.includes('producto')) p.product = line[i];
                    else if (key.includes('category') || key.includes('categoría')) p.category = line[i];
                    else if (key.includes('price') || key.includes('precio')) p.priceUsd = line[i];
                    else if (key.includes('status') || key.includes('estado')) p.status = line[i];
                    else if (key.includes('discount(en)') || key.includes('descuento(en)')) p.bulkDiscountEn = line[i];
                    else if (key.includes('discount(es)') || key.includes('descuento(es)')) p.bulkDiscountEs = line[i];
                    else if (key.includes('coa')) p.coa = line[i];
                    else if (key.includes('image') || key.includes('imagen')) p.imageUrl = line[i];
                  });

                  const usdNum = parseFloat((p.priceUsd || '').replace(/[^0-9.]/g, '')) || 0;
                  const calculatedCrc = Math.round(usdNum * EXCHANGE_RATE);

                  return {
                    id: `local-${idx}`,
                    product: p.product || '',
                    category: p.category || '',
                    priceUsd: p.priceUsd || '',
                    priceCrc: calculatedCrc > 0 ? `₡${calculatedCrc.toLocaleString('en-US')}` : '',
                    discount: p.bulkDiscountEs || p.bulkDiscountEn || '',
                    status: p.status || 'In Stock',
                    coa: p.coa || '',
                    imageUrl: p.imageUrl || '',
                    priority: idx
                  };
                });

              setProducts(parsed);
            }
          }
        });
      } catch (err) {
        console.error("Local CSV load error:", err);
      }
    } else {
      setProducts(loadedProducts);
    }
    setLoadingProducts(false);

    // 2. Fetch Orders
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to load orders from database:", err);
      }
    }
    setLoadingOrders(false);
  };

  // Trigger loading when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    // 1. Direct simulation bypass credentials
    if (email.trim() === 'admin@costapeptides.com' && password === 'CostaPeptides2026!') {
      setIsAuthenticated(true);
      setLoginLoading(false);
      return;
    }

    // 2. Try Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setLoginError(error.message);
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        setLoginError("Login service currently unavailable.");
      }
    } else {
      setLoginError("Invalid admin credentials.");
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  // Spreadsheet Cell modification helper
  const handleCellChange = (productId, fieldName, val) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, [fieldName]: val } : p
    ));
  };

  // Add Product row
  const handleAddRow = () => {
    const newPriority = products.length > 0 ? Math.max(...products.map(p => p.priority)) + 1 : 0;
    const newRow = {
      id: `temp-${Date.now()}`,
      product: 'New Peptide Name',
      category: 'Weight Loss & Metabolism',
      priceUsd: '$100',
      priceCrc: '₡45,448',
      discount: 'Buy 5+ vials, get 15% off',
      status: 'In Stock',
      coa: '',
      imageUrl: '',
      priority: newPriority
    };
    setProducts([...products, newRow]);
  };

  // Delete row
  const handleDeleteRow = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  // CSV drag uploader
  const handleCsvDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setCsvDragActive(true);
    } else if (e.type === "dragleave") {
      setCsvDragActive(false);
    }
  };

  const handleCsvDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCsvDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseUploadedCsv(e.dataTransfer.files[0]);
    }
  };

  const handleCsvFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      parseUploadedCsv(e.target.files[0]);
    }
  };

  const parseUploadedCsv = (file) => {
    setCsvLoading(true);
    setCsvStatus('');

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const lines = results.data;
        const headerIndex = lines.findIndex(l => l.some(cell => cell && cell.toLowerCase().includes('product')));

        if (headerIndex === -1) {
          setCsvStatus("Could not find product header row. Please verify CSV columns.");
          setCsvLoading(false);
          return;
        }

        const headers = lines[headerIndex].map(h => h.toLowerCase().trim());
        const dataLines = lines.slice(headerIndex + 1);

        const imported = dataLines
          .filter(line => line[0])
          .map((line, idx) => {
            const p = {};
            headers.forEach((h, i) => {
              const key = h.replace(/\s+/g, '');
              if (key.includes('product') || key.includes('producto')) p.product = line[i];
              else if (key.includes('category') || key.includes('categoría')) p.category = line[i];
              else if (key.includes('price') || key.includes('precio')) p.priceUsd = line[i];
              else if (key.includes('status') || key.includes('estado')) p.status = line[i];
              else if (key.includes('discount(en)') || key.includes('descuento(en)')) p.bulkDiscountEn = line[i];
              else if (key.includes('discount(es)') || key.includes('descuento(es)')) p.bulkDiscountEs = line[i];
              else if (key.includes('coa')) p.coa = line[i];
              else if (key.includes('image') || key.includes('imagen')) p.imageUrl = line[i];
            });

            const usdNum = parseFloat((p.priceUsd || '').replace(/[^0-9.]/g, '')) || 0;
            const calculatedCrc = Math.round(usdNum * EXCHANGE_RATE);

            return {
              id: `imported-${idx}-${Date.now()}`,
              product: p.product || '',
              category: p.category || '',
              priceUsd: p.priceUsd || '',
              priceCrc: p.priceCrc || (calculatedCrc > 0 ? `₡${calculatedCrc.toLocaleString('en-US')}` : ''),
              discount: p.bulkDiscountEs || p.bulkDiscountEn || '',
              status: p.status || 'In Stock',
              coa: p.coa || '',
              imageUrl: p.imageUrl || '',
              priority: idx
            };
          });

        setProducts(imported);
        setCsvStatus(`Successfully loaded ${imported.length} products from CSV into grid. Click "Save Changes" to sync database.`);
        setCsvLoading(false);
      },
      error: (err) => {
        setCsvStatus(`Parsing error: ${err.message}`);
        setCsvLoading(false);
      }
    });
  };

  // Image Upload handler for cell
  const handleImageCellUpload = async (productId, e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // Show indicator
    handleCellChange(productId, 'imageUrl', 'Uploading...');

    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to bucket
        const { error: uploadError } = await supabase.storage
          .from('product-pics')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-pics')
          .getPublicUrl(filePath);

        handleCellChange(productId, 'imageUrl', publicUrl);
      } catch (err) {
        console.error("Storage upload error:", err);
        handleCellChange(productId, 'imageUrl', '');
        alert("Image upload failed. Please verify that your Supabase Storage bucket 'product-pics' exists and is set to public.");
      }
    } else {
      // Local simulation URL
      const dummyUrl = URL.createObjectURL(file);
      handleCellChange(productId, 'imageUrl', dummyUrl);
      alert("Local Simulation: Image loaded inside browser memory. To upload permanently, connect Supabase!");
    }
  };

  // Order status update
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);
      } catch(err) {
        console.error("Order status update error:", err);
      }
    }
  };

  // Save changes batch
  const handleSaveChanges = async () => {
    setSaveLoading(true);
    setSaveStatus('');

    if (isSupabaseConfigured && supabase) {
      try {
        // Get all currently existing database UUIDs from the active list
        const activeIds = products
          .map(p => p.id)
          .filter(id => id && !id.toString().startsWith('temp-') && !id.toString().startsWith('local-'));

        // 1. Delete products that were removed in the editor
        let deleteQuery = supabase.from('products').delete();
        if (activeIds.length > 0) {
          deleteQuery = deleteQuery.not('id', 'in', `(${activeIds.join(',')})`);
        } else {
          // If no products remain, delete all safely
          deleteQuery = deleteQuery.neq('id', '00000000-0000-0000-0000-000000000000');
        }
        const { error: deleteError } = await deleteQuery;
        if (deleteError) throw deleteError;

        // 2. Format row fields
        const itemsToUpdate = [];
        const itemsToInsert = [];

        products.forEach((p, idx) => {
          const row = {
            product: p.product,
            category: p.category,
            price_usd: p.priceUsd,
            price_crc: p.priceCrc,
            discount: p.discount,
            status: p.status,
            coa: p.coa,
            image_url: p.imageUrl,
            emoji: p.imageUrl ? '' : getEmojiForCategory(p.category),
            priority: idx
          };
          if (p.id && !p.id.toString().startsWith('temp-') && !p.id.toString().startsWith('local-')) {
            row.id = p.id;
            itemsToUpdate.push(row);
          } else {
            itemsToInsert.push(row);
          }
        });

        // 3. Batch upsert existing records
        if (itemsToUpdate.length > 0) {
          const { error: upsertError } = await supabase
            .from('products')
            .upsert(itemsToUpdate);
          if (upsertError) throw upsertError;
        }

        // 4. Batch insert new records
        if (itemsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('products')
            .insert(itemsToInsert);
          if (insertError) throw insertError;
        }

        setSaveStatus("Changes successfully saved to database!");
        loadAdminData(); // reload fresh rows
      } catch (err) {
        console.error("Database save changes error:", err);
        setSaveStatus(`Failed to save: ${err.message || 'Row Level Security error'}`);
      }
    } else {
      setSaveStatus("Local Simulation: Saved products data state inside browser memory!");
    }

    setSaveLoading(false);
    setTimeout(() => setSaveStatus(''), 4000);
  };

  const getEmojiForCategory = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('weight') || c.includes('peso')) return '⚖️';
    if (c.includes('sleep') || c.includes('sueño')) return '🌙';
    if (c.includes('sexual')) return '🔥';
    if (c.includes('skin') || c.includes('piel')) return '✨';
    if (c.includes('immune') || c.includes('inmune')) return '🛡️';
    if (c.includes('supply') || c.includes('suministro')) return '💧';
    if (c.includes('brain') || c.includes('cerebro')) return '🧠';
    if (c.includes('muscle') || c.includes('músculo')) return '💪';
    return '💊';
  };

  // Copy shareable link
  const getShareUrl = () => {
    const domain = typeof window !== 'undefined' ? window.location.origin : 'https://costapeptides.vercel.app';
    return `${domain}/catalog?lang=${shareLang}&currency=${shareCurrency}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // Prevent hydration mismatch by skipping SSR for admin portal entirely
  if (!mounted) return null;

  // Render Login Card if not logged in
  if (!isAuthenticated) {
    return (
      <div className="admin-layout" suppressHydrationWarning>
        <div className="admin-login-container">
          <div className="admin-login-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <img src="/logo_transparent.png" alt="Peptides Costa Rica Admin" style={{ maxHeight: '70px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <p>Admin Security Dashboard</p>
            
            {loginError && <div className="error-msg">{loginError}</div>}
            
            <form onSubmit={handleLogin}>
              <input 
                type="email" 
                placeholder="Admin Email Address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Access Password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" disabled={loginLoading}>
                {loginLoading ? (
                  <div className="sync-spinner" style={{ width: '16px', height: '16px' }}></div>
                ) : (
                  'Authenticate Access'
                )}
              </button>
            </form>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '20px', lineHeight: '1.4' }}>
              ✨ Local Bypass Support: Log in instantly with credentials listed in your approved implementation plan.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout min-h-screen" suppressHydrationWarning>
      {/* Navbar Header */}
      <nav className="admin-navbar">
        <div className="admin-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo_transparent.png" alt="Logo" style={{ maxHeight: '36px', width: 'auto', objectFit: 'contain' }} />
          <span>{isDbConnected ? 'Live Cloud Database' : 'Simulation Mode'}</span>
        </div>
        <div className="admin-nav-actions">
          <button 
            className={`admin-tab-btn ${activeTab === 'spreadsheet' ? 'active' : ''}`}
            onClick={() => setActiveTab('spreadsheet')}
          >
            Spreadsheet Editor
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders History {orders.length > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>{orders.length}</span>}
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            Share Links
          </button>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Admin dashboard container */}
      <div className="admin-container">
        
        {/* TAB 1: SPREADSHEET EDITOR */}
        {activeTab === 'spreadsheet' && (
          <div>
            <div className="admin-toolbar">
              <div>
                <h3>Master Inventory Products</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  Edit details in place exactly like Excel. Changes will sync live to customers once you click **Save Changes**.
                </p>
              </div>
              <div className="admin-actions-row">
                <button className="admin-btn" onClick={() => setIsCsvOpen(!isCsvOpen)}>
                  <Upload size={16} />
                  {isCsvOpen ? 'Hide CSV Importer' : 'Import CSV'}
                </button>
                <button className="admin-btn admin-btn-accent" onClick={handleAddRow}>
                  <Plus size={16} />
                  Add Product Row
                </button>
                <button className="admin-btn admin-btn-primary" onClick={handleSaveChanges} disabled={saveLoading}>
                  <Save size={16} />
                  {saveLoading ? 'Syncing DB...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {saveStatus && (
              <div className="csv-status-banner" style={{ background: saveStatus.includes('Failed') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', borderColor: saveStatus.includes('Failed') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: saveStatus.includes('Failed') ? '#f87171' : '#4ade80' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {saveStatus.includes('Failed') ? <AlertCircle size={16} /> : <Check size={16} />}
                  <span>{saveStatus}</span>
                </div>
              </div>
            )}

            {/* Collapsible Google sheet drag uploader */}
            {isCsvOpen && (
              <div 
                className={`csv-dropzone ${csvDragActive ? 'drag-active' : ''}`}
                onDragEnter={handleCsvDrag}
                onDragOver={handleCsvDrag}
                onDragLeave={handleCsvDrag}
                onDrop={handleCsvDrop}
              >
                <Upload className="csv-dropzone-icon" />
                <h4>Import Google Spreadsheet CSV</h4>
                <p>Drag and drop your exported `master_sheet.csv` here, or click to browse files from your computer.</p>
                <input 
                  type="file" 
                  accept=".csv" 
                  style={{ display: 'none' }} 
                  id="csvFileInput" 
                  onChange={handleCsvFileSelect}
                />
                <button 
                  className="admin-btn" 
                  style={{ marginTop: '8px' }}
                  onClick={() => document.getElementById('csvFileInput').click()}
                >
                  Choose CSV File
                </button>
              </div>
            )}

            {csvStatus && (
              <div className="csv-status-banner" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                <span>{csvStatus}</span>
                <button className="admin-btn" style={{ fontSize: '0.7rem', padding: '4px 8px' }} onClick={() => setCsvStatus('')}>Dismiss</button>
              </div>
            )}

            {/* Main Spreadsheet grid */}
            {loadingProducts ? (
              <div className="loader">
                <div className="sync-spinner" style={{ marginBottom: '16px' }}></div>
                <div>Fetching master inventory table...</div>
              </div>
            ) : (
              <div className="spreadsheet-container">
                <table className="spreadsheet-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th style={{ minWidth: '220px' }}>Product Peptide Name</th>
                      <th style={{ minWidth: '180px' }}>Category</th>
                      <th style={{ width: '100px' }}>Price (USD)</th>
                      <th style={{ width: '100px' }}>Price (CRC)</th>
                      <th style={{ minWidth: '180px' }}>Stock Status</th>
                      <th style={{ minWidth: '180px' }}>Volume/Bulk Discount Info</th>
                      <th style={{ minWidth: '200px' }}>Image URL / Physical Upload</th>
                      <th style={{ minWidth: '220px' }}>COA URL Link</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, idx) => (
                      <tr key={p.id}>
                        <td data-label="#" style={{ color: '#64748b', fontWeight: 'bold', textAlign: 'center' }}>{idx + 1}</td>
                        
                        {/* Name */}
                        <td data-label="Product Peptide Name">
                          <div 
                            contentEditable 
                            suppressContentEditableWarning
                            className="cell-editable"
                            onBlur={(e) => handleCellChange(p.id, 'product', e.target.innerText)}
                          >
                            {p.product}
                          </div>
                        </td>

                        {/* Category */}
                        <td data-label="Category">
                          <select 
                            className="cell-select"
                            value={p.category}
                            onChange={(e) => handleCellChange(p.id, 'category', e.target.value)}
                          >
                            {Object.keys(CATEGORY_TRANSLATIONS).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </td>

                        {/* USD Price */}
                        <td data-label="Price (USD)">
                          <div 
                            contentEditable 
                            suppressContentEditableWarning
                            className="cell-editable"
                            onBlur={(e) => {
                              const v = e.target.innerText;
                              handleCellChange(p.id, 'priceUsd', v);
                              // Auto calculate CRC price if missing
                              const usdNum = parseFloat(v.replace(/[^0-9.]/g, '')) || 0;
                              if (usdNum > 0 && (!p.priceCrc || p.priceCrc.trim() === '')) {
                                const calc = Math.round(usdNum * EXCHANGE_RATE);
                                handleCellChange(p.id, 'priceCrc', `₡${calc.toLocaleString('en-US')}`);
                              }
                            }}
                          >
                            {p.priceUsd}
                          </div>
                        </td>

                        {/* CRC Price */}
                        <td data-label="Price (CRC)">
                          <div 
                            contentEditable 
                            suppressContentEditableWarning
                            className="cell-editable"
                            onBlur={(e) => handleCellChange(p.id, 'priceCrc', e.target.innerText)}
                          >
                            {p.priceCrc}
                          </div>
                        </td>

                        {/* Status */}
                        <td data-label="Stock Status">
                          <select 
                            className="cell-select"
                            value={p.status}
                            onChange={(e) => handleCellChange(p.id, 'status', e.target.value)}
                            style={{ 
                              color: p.status.toLowerCase().includes('in stock') || p.status.toLowerCase().includes('disponible') ? '#4ade80' : p.status.toLowerCase().includes('coming soon') || p.status.toLowerCase().includes('próximamente') ? '#facc15' : '#f87171',
                              fontWeight: 'bold'
                            }}
                          >
                            <option value="In Stock">In Stock / Disponible</option>
                            <option value="Out of Stock">Out of Stock / Agotado</option>
                            <option value="Coming Soon">Coming Soon / Próximamente</option>
                          </select>
                        </td>

                        {/* Discount */}
                        <td data-label="Volume/Bulk Discount Info">
                          <div 
                            contentEditable 
                            suppressContentEditableWarning
                            className="cell-editable"
                            onBlur={(e) => handleCellChange(p.id, 'discount', e.target.innerText)}
                          >
                            {p.discount}
                          </div>
                        </td>

                        {/* Image cell with Drag physical upload */}
                        <td data-label="Image URL / Physical Upload">
                          <div className="admin-image-cell">
                            <div className="admin-image-preview">
                              {p.imageUrl && p.imageUrl.startsWith('http') ? (
                                <img src={p.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                getEmojiForCategory(p.category)
                              )}
                            </div>
                            <div 
                              contentEditable 
                              suppressContentEditableWarning
                              className="cell-editable"
                              style={{ flexGrow: 1, minWidth: '80px', maxWidth: '150px', fontSize: '0.7rem', color: '#94a3b8', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                              onBlur={(e) => handleCellChange(p.id, 'imageUrl', e.target.innerText)}
                              title={p.imageUrl}
                            >
                              {p.imageUrl}
                            </div>
                            <input 
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              id={`imageUpload-${p.id}`}
                              onChange={(e) => handleImageCellUpload(p.id, e)}
                            />
                            <button 
                              className="admin-image-upload-btn"
                              title="Upload picture"
                              onClick={() => document.getElementById(`imageUpload-${p.id}`).click()}
                            >
                              <Upload size={12} />
                            </button>
                          </div>
                        </td>

                        {/* COA Link */}
                        <td data-label="COA URL Link">
                          <div 
                            contentEditable 
                            suppressContentEditableWarning
                            className="cell-editable"
                            style={{ minWidth: '80px', maxWidth: '150px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                            onBlur={(e) => handleCellChange(p.id, 'coa', e.target.innerText)}
                            title={p.coa}
                          >
                            {p.coa}
                          </div>
                        </td>

                        {/* Actions */}
                        <td data-label="Action" style={{ textAlign: 'center' }}>
                          <button className="admin-delete-btn" onClick={() => handleDeleteRow(p.id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS LEDGER HISTORY */}
        {activeTab === 'orders' && (
          <div>
            <div className="admin-toolbar">
              <div>
                <h3>Customer Orders Log Ledger</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  A secure listing of all catalog order intents placed by customers. Double check entries here before coordinating dispatches on WhatsApp.
                </p>
              </div>
            </div>

            {loadingOrders ? (
              <div className="loader">
                <div className="sync-spinner" style={{ marginBottom: '16px' }}></div>
                <div>Fetching logs from database...</div>
              </div>
            ) : orders.length === 0 ? (
              <div className="loader" style={{ background: '#0e1626', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <Database size={32} style={{ margin: '0 auto 16px auto', opacity: 0.3, display: 'block' }} />
                No orders registered in the system yet.
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map(order => {
                  const items = Array.isArray(order.items) ? order.items : [];
                  const orderDate = new Date(order.created_at).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
                  
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-card-header">
                        <div className="order-customer-info">
                          <h4>{order.customer_name}</h4>
                          <p>WhatsApp: {order.customer_phone}</p>
                        </div>
                        <div className="order-meta-info">
                          <span className="order-date">{orderDate}</span>
                          <select 
                            className="cell-select"
                            value={order.status || 'Pending'}
                            onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                            style={{
                              width: '120px',
                              background: order.status === 'Completed' ? 'rgba(34, 197, 94, 0.2)' : order.status === 'Paid' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: order.status === 'Completed' ? '#4ade80' : order.status === 'Paid' ? '#38bdf8' : '#f59e0b',
                              fontWeight: 'bold',
                              border: 'none',
                              textAlign: 'center'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <table className="order-items-table">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                            <th style={{ width: '120px', textAlign: 'right' }}>Price Each</th>
                            <th style={{ width: '140px', textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, i) => (
                            <tr key={i}>
                              <td>{item.product}</td>
                              <td style={{ textAlign: 'center' }}>x{item.qty}</td>
                              <td style={{ textAlign: 'right' }}>
                                {order.currency === 'USD' ? `$${item.price}` : `₡${item.price.toLocaleString('en-US')}`}
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                {order.currency === 'USD' ? `$${item.price * item.qty}` : `₡${(item.price * item.qty).toLocaleString('en-US')}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="order-card-footer">
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span className="order-total-lbl">Revenues:</span>
                          <span className="order-total-val">
                            {order.currency === 'USD' 
                              ? `$${order.total_usd}` 
                              : `₡${order.total_crc.toLocaleString('en-US')}`
                            }
                          </span>
                        </div>
                        
                        {/* WhatsApp direct contact link */}
                        <a 
                          href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="admin-btn"
                          style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}
                        >
                          <MessageSquare size={14} />
                          Open WhatsApp Chat
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHARE LINKS GENERATOR */}
        {activeTab === 'share' && (
          <div>
            <div className="admin-toolbar">
              <div>
                <h3>Share Catalog Overrides Links</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  Generate custom pre-configured links for different user groups (such as English speakers or currency preferences) to share directly in WhatsApp or bio pages.
                </p>
              </div>
            </div>

            <div className="order-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="share-link-builder">
                <div className="share-select-row">
                  <div className="filter-group">
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800' }}>Preselected Language</label>
                    <select 
                      className="cell-select" 
                      value={shareLang}
                      onChange={(e) => setShareLang(e.target.value)}
                    >
                      <option value="es">Spanish / Español</option>
                      <option value="en">English / Inglés</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800' }}>Preselected Currency</label>
                    <select 
                      className="cell-select" 
                      value={shareCurrency}
                      onChange={(e) => setShareCurrency(e.target.value)}
                    >
                      <option value="CRC">CRC / Colones Costarricenses</option>
                      <option value="USD">USD / Dólares Estadounidenses</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '8px' }}>Your Customized Share URL</label>
                  <div className="share-copy-wrapper">
                    <div className="share-url-box">{getShareUrl()}</div>
                    <button 
                      className="admin-btn admin-btn-primary" 
                      onClick={handleCopyLink}
                      style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {shareCopied ? <Check size={16} /> : <Share2 size={16} />}
                      {shareCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div style={{ background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.1)', padding: '16px', borderRadius: '8px', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.5', marginTop: '16px' }}>
                  💡 **Sharing Pro-Tip:** Placing `lang=en` inside links will automatically translate all category names, buttons, and stock badges to English, and toggle the catalog to prioritize USD pricing immediately for international clients!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
