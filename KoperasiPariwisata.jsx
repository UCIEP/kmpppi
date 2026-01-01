import React, { useState } from 'react';
import { 
  Users, Package, ShoppingBag, MessageSquare, 
  CheckCircle, Plus, Search, LogOut, DollarSign, 
  Briefcase, MapPin, Calendar, ArrowRight, X, User,
  ShoppingCart, Trash2, CreditCard, Image as ImageIcon, FileText, Eye,
  PlayCircle, CheckSquare // Added icons for actions
} from 'lucide-react';

// --- MOCK DATA & UTILS ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_USERS = [
  { id: 'admin1', name: 'Admin Koperasi', email: 'admin@koperasi.id', role: 'admin', password: '123' },
  { id: 'vendor1', name: 'Bali Tour Travel', email: 'vendor@bali.id', role: 'vendor', password: '123', location: 'Denpasar' },
  { id: 'vendor2', name: 'Jogja Transport', email: 'vendor@jogja.id', role: 'vendor', password: '123', location: 'Yogyakarta' },
  { id: 'user1', name: 'Budi Wisatawan', email: 'budi@gmail.com', role: 'user', password: '123' },
];

const INITIAL_PRODUCTS = [
  { 
    id: 'p1', 
    vendorId: 'vendor1', 
    vendorName: 'Bali Tour Travel', 
    name: 'Paket Tour Nusa Penida 1 Hari', 
    price: 750000, 
    category: 'Tour', 
    image: 'https://images.unsplash.com/photo-1596395818837-29e71072930e?auto=format&fit=crop&q=80&w=400', 
    desc: 'All in termasuk speed boat dan makan siang.',
    stock: 20,
    variants: ['Pagi (08:00)', 'Siang (11:00)']
  },
  { 
    id: 'p2', 
    vendorId: 'vendor2', 
    vendorName: 'Jogja Transport', 
    name: 'Sewa Hiace 12 Jam', 
    price: 1200000, 
    category: 'Transport', 
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=400', 
    desc: 'Mobil bersih, driver ramah, bbm included.',
    stock: 5,
    variants: ['Lepas Kunci', 'Dengan Supir']
  },
];

const INITIAL_REQUESTS = [
  { 
    id: 'r1', 
    userId: 'user1', 
    userName: 'Budi Wisatawan', 
    title: 'Tiket Pesawat Jakarta - Bali (Grup)', 
    desc: 'Butuh tiket untuk 10 orang keberangkatan tgl 20 Des. Budget max 1.5jt/org.', 
    budget: 15000000, 
    status: 'open', 
    date: '2024-10-25' 
  }
];

const INITIAL_OFFERS = [
  {
    id: 'o1',
    requestId: 'r1',
    vendorId: 'vendor1',
    vendorName: 'Bali Tour Travel',
    price: 14500000,
    message: 'Halo Pak Budi, kami bisa provide Batik Air jam 10 pagi. Total 14.5jt.',
    status: 'pending' 
  }
];

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
};

// --- COMPONENTS ---

export default function App() {
  // --- STATE ---
  const [activeUser, setActiveUser] = useState(null); 
  const [users, setUsers] = useState(INITIAL_USERS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [orders, setOrders] = useState([]); 
  const [cart, setCart] = useState([]); 

  // Navigation State
  const [view, setView] = useState('login'); 
  
  // Auth Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState('user');

  // Modals / Overlays
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // --- CART HELPERS ---
  const addToCart = (product, qty, variant, note) => {
    const existingItem = cart.find(item => item.id === product.id && item.variant === variant);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id && item.variant === variant 
          ? { ...item, qty: item.qty + qty } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, qty, variant, note, cartId: generateId() }]);
    }
    setModalContent(<AlertModal title="Berhasil" message="Produk masuk keranjang!" onClose={()=>setModalOpen(false)} />);
    setModalOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  // --- REUSABLE MODAL COMPONENTS ---

  const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Batal</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-md">Ya, Lanjutkan</button>
        </div>
      </div>
    </div>
  );

  const AlertModal = ({ title, message, onClose, type = 'success' }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {type === 'success' ? <CheckCircle size={24} /> : <X size={24} />}
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button onClick={onClose} className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200">Tutup</button>
      </div>
    </div>
  );

  const ImageViewModal = ({ src, alt, onClose }) => (
     <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4" onClick={onClose}>
        <img src={src} alt={alt} className="max-w-full max-h-screen rounded" />
        <button className="absolute top-4 right-4 text-white p-2 bg-gray-800 rounded-full"><X size={24}/></button>
     </div>
  );

  // --- FEATURE SPECIFIC MODALS (RESTORED & IMPROVED) ---

  const CreateRequestModal = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [budget, setBudget] = useState('');
    const [desc, setDesc] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      const newReq = {
        id: generateId(),
        userId: activeUser.id,
        userName: activeUser.name,
        title,
        budget: parseInt(budget),
        desc,
        status: 'open',
        date: new Date().toLocaleDateString()
      };
      setRequests([...requests, newReq]);
      onClose();
      setModalContent(<AlertModal title="Berhasil" message="Request Anda berhasil diposting!" onClose={()=>setModalOpen(false)} />);
      setModalOpen(true);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Buat Request Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="w-full border p-2 rounded" placeholder="Judul (Contoh: Tiket Pesawat ke Bali)" value={title} onChange={e=>setTitle(e.target.value)} required />
            <input className="w-full border p-2 rounded" type="number" placeholder="Budget Max (IDR)" value={budget} onChange={e=>setBudget(e.target.value)} required />
            <textarea className="w-full border p-2 rounded" placeholder="Detail kebutuhan..." value={desc} onChange={e=>setDesc(e.target.value)} required />
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Batal</button>
              <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">Posting</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const MakeOfferModal = ({ request, onClose }) => {
    const [price, setPrice] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      const newOffer = {
        id: generateId(),
        requestId: request.id,
        vendorId: activeUser.id,
        vendorName: activeUser.name,
        price: parseInt(price),
        message,
        status: 'pending'
      };
      setOffers([...offers, newOffer]);
      onClose();
      setModalContent(<AlertModal title="Terkirim" message="Penawaran Anda berhasil dikirim." onClose={()=>setModalOpen(false)} />);
      setModalOpen(true);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-2">Ajukan Penawaran</h3>
          <p className="text-sm text-gray-500 mb-4">Untuk: {request.title}</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="w-full border p-2 rounded" type="number" placeholder="Harga Penawaran (IDR)" value={price} onChange={e=>setPrice(e.target.value)} required />
            <textarea className="w-full border p-2 rounded" placeholder="Pesan untuk pembeli..." value={message} onChange={e=>setMessage(e.target.value)} required />
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Batal</button>
              <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">Kirim</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ProductDetailModal = ({ product, onClose }) => {
    const [qty, setQty] = useState(1);
    const [variant, setVariant] = useState(product.variants?.[0] || 'Standard');
    const [note, setNote] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl">
          <div className="w-full md:w-1/2 bg-gray-100 p-4 flex items-center justify-center">
            <img src={product.image} alt={product.name} className="max-w-full max-h-80 object-cover rounded-lg shadow" />
          </div>
          <div className="w-full md:w-1/2 p-8 flex flex-col">
             <div className="flex justify-between items-start">
               <div>
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">{product.category}</span>
                  <h2 className="text-2xl font-bold mt-2 text-gray-800">{product.name}</h2>
                  <p className="text-sm text-gray-500">{product.vendorName}</p>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
             </div>
             
             <div className="mt-4">
               <h3 className="text-3xl font-bold text-teal-700">{formatRupiah(product.price)}</h3>
               <p className="mt-4 text-gray-600 leading-relaxed">{product.desc}</p>
               <p className="mt-2 text-sm font-semibold text-gray-500">Stok Tersedia: {product.stock}</p>
             </div>

             <div className="mt-6 space-y-4 flex-1">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Varian</label>
                   <div className="flex flex-wrap gap-2">
                     {product.variants && product.variants.map(v => (
                       <button 
                         key={v}
                         onClick={() => setVariant(v)}
                         className={`px-4 py-2 border rounded-lg text-sm transition ${variant === v ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                       >
                         {v}
                       </button>
                     ))}
                   </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={product.stock}
                      value={qty}
                      onChange={(e) => setQty(parseInt(e.target.value))}
                      className="w-full border p-2 rounded-lg text-center"
                    />
                  </div>
                  <div className="w-2/3">
                     <label className="block text-sm font-bold text-gray-700 mb-2">Catatan (Opsional)</label>
                     <input 
                        type="text" 
                        placeholder="Contoh: Jemput di lobby hotel"
                        value={note}
                        onChange={(e)=>setNote(e.target.value)}
                        className="w-full border p-2 rounded-lg"
                     />
                  </div>
                </div>
             </div>

             <div className="mt-8 pt-4 border-t">
               <button 
                 onClick={() => {
                   if(qty > product.stock) {
                      alert("Stok tidak mencukupi!");
                      return;
                   }
                   addToCart(product, qty, variant, note);
                   onClose();
                 }}
                 className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center"
               >
                 <ShoppingCart className="mr-2" size={20} /> Tambah ke Keranjang
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const CheckoutModal = ({ onClose }) => {
    const [paymentMethod, setPaymentMethod] = useState('Transfer BCA');
    const [proofFile, setProofFile] = useState(null);
    const total = getCartTotal();

    const handleFileChange = (e) => {
       if (e.target.files && e.target.files[0]) {
         setProofFile(URL.createObjectURL(e.target.files[0]));
       }
    };

    const handleConfirm = () => {
      if (!proofFile) {
        alert("Mohon upload bukti transfer terlebih dahulu.");
        return;
      }
      const newOrders = cart.map(item => ({
        id: generateId(),
        itemId: item.id,
        itemName: item.name,
        buyerId: activeUser.id,
        buyerName: activeUser.name,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        price: item.price,
        totalPrice: item.price * item.qty,
        quantity: item.qty,
        variant: item.variant,
        note: item.note,
        paymentMethod: paymentMethod,
        paymentProof: proofFile,
        date: new Date().toLocaleDateString(),
        status: 'pending_verification'
      }));

      // Update Stock
      const updatedProducts = products.map(p => {
        const cartItem = cart.find(c => c.id === p.id);
        if (cartItem) return { ...p, stock: p.stock - cartItem.qty };
        return p;
      });

      setProducts(updatedProducts);
      setOrders([...orders, ...newOrders]);
      setCart([]);
      onClose();
      setModalContent(<AlertModal title="Pesanan Berhasil" message="Pesanan sedang diproses. Menunggu verifikasi vendor." onClose={()=>setModalOpen(false)} />);
      setModalOpen(true);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 flex items-center"><CreditCard className="mr-2"/> Checkout Pesanan</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
             <div className="flex justify-between font-bold text-lg mb-2">
               <span>Total Bayar:</span>
               <span className="text-teal-700">{formatRupiah(total)}</span>
             </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Metode Pembayaran</label>
              <select className="w-full border p-2 rounded-lg" value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>
                <option>Transfer BCA - 1234567890 (Koperasi)</option>
                <option>Transfer Mandiri - 0987654321 (Koperasi)</option>
                <option>QRIS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Upload Bukti Transfer</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition relative">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {!proofFile ? (
                   <div className="text-gray-400 flex flex-col items-center">
                     <ImageIcon size={32} />
                     <span className="text-xs mt-2">Klik untuk upload gambar</span>
                   </div>
                ) : (
                   <div className="relative">
                      <img src={proofFile} alt="Bukti" className="max-h-32 mx-auto rounded" />
                      <p className="text-xs text-green-600 mt-2 font-bold">File terpilih</p>
                   </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-gray-600">Batal</button>
            <button onClick={handleConfirm} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 font-bold">Konfirmasi Bayar</button>
          </div>
        </div>
      </div>
    );
  };

  const AddProductModal = ({ onClose }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState('Tour');
    const [stock, setStock] = useState('10');
    const [variants, setVariants] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const newProd = {
        id: generateId(),
        vendorId: activeUser.id,
        vendorName: activeUser.name,
        name,
        price: parseInt(price),
        desc,
        category,
        stock: parseInt(stock),
        variants: variants.split(',').map(v => v.trim()).filter(v => v !== ''),
        image: imageFile || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=400'
      };
      setProducts([...products, newProd]);
      onClose();
      setModalContent(<AlertModal title="Berhasil" message="Produk berhasil ditambahkan." onClose={()=>setModalOpen(false)} />);
      setModalOpen(true);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Tambah Produk Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="w-full border p-2 rounded" placeholder="Nama Produk" value={name} onChange={e=>setName(e.target.value)} required />
            <div className="flex gap-2">
                <select className="w-1/2 border p-2 rounded" value={category} onChange={e=>setCategory(e.target.value)}>
                <option>Tour</option>
                <option>Transport</option>
                <option>Hotel</option>
                <option>Attraction</option>
                </select>
                <input className="w-1/2 border p-2 rounded" type="number" placeholder="Stok" value={stock} onChange={e=>setStock(e.target.value)} required />
            </div>
            <input className="w-full border p-2 rounded" type="number" placeholder="Harga (IDR)" value={price} onChange={e=>setPrice(e.target.value)} required />
            <input className="w-full border p-2 rounded" placeholder="Varian (Pisahkan koma, cth: Pagi, Siang)" value={variants} onChange={e=>setVariants(e.target.value)} />
            <textarea className="w-full border p-2 rounded" placeholder="Deskripsi Lengkap" rows="3" value={desc} onChange={e=>setDesc(e.target.value)} required />
            
            {/* Image Upload Section */}
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Foto Produk</label>
               <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition relative">
                 <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                 {!imageFile ? (
                     <div className="text-gray-400 flex flex-col items-center">
                       <ImageIcon size={32} />
                       <span className="text-xs mt-2">Klik untuk upload foto produk</span>
                     </div>
                 ) : (
                     <div className="relative group">
                        <img src={imageFile} alt="Preview" className="h-32 mx-auto rounded object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded">
                          <span className="text-white text-xs font-bold">Ganti Foto</span>
                        </div>
                     </div>
                 )}
               </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Batal</button>
              <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.email === loginEmail && u.password === loginPass);
    if (user) {
      setActiveUser(user);
      setView('dashboard');
      setLoginError('');
    } else {
      setLoginError('Email atau password salah!');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const newUser = { id: generateId(), name: regName, email: regEmail, password: regPass, role: regRole, joined: new Date().toLocaleDateString() };
    setUsers([...users, newUser]);
    setIsRegistering(false);
    setModalContent(<AlertModal title="Registrasi Berhasil" message="Akun Anda telah dibuat. Silakan login." onClose={() => setModalOpen(false)} />);
    setModalOpen(true);
  };

  const handleLogout = () => {
    setActiveUser(null);
    setView('login');
    setCart([]);
  };

  // --- SUB-COMPONENTS ---

  const Navbar = () => (
    <nav className="bg-teal-700 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={()=>setView('dashboard')}>
        <div className="bg-white p-1 rounded-full text-teal-700">
          <Briefcase size={24} />
        </div>
        <div className="hidden md:block">
          <h1 className="font-bold text-xl">Koperasi Pariwisata</h1>
          <p className="text-xs text-teal-100">Solusi Terpadu Pelaku Wisata</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {activeUser?.role === 'user' && (
          <button onClick={() => setView('cart')} className="relative p-2 hover:bg-teal-800 rounded-full transition">
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        )}
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold">{activeUser?.name}</p>
          <p className="text-xs opacity-80 uppercase">{activeUser?.role}</p>
        </div>
        <button onClick={handleLogout} className="bg-teal-800 hover:bg-teal-900 p-2 rounded-lg transition">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );

  const Sidebar = () => {
    const MenuItem = ({ icon: Icon, label, targetView }) => (
      <button 
        onClick={() => setView(targetView)}
        className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition ${view === targetView ? 'bg-teal-100 text-teal-800 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );

    return (
      <div className="w-64 bg-white border-r h-screen hidden md:block p-4 fixed mt-16 top-0 bottom-0 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Menu Utama</p>
          <MenuItem icon={Users} label="Dashboard" targetView="dashboard" />
          
          {activeUser.role === 'admin' && (
            <>
              <MenuItem icon={User} label="Kelola User" targetView="admin_users" />
              <MenuItem icon={ShoppingBag} label="Semua Produk" targetView="products" />
              <MenuItem icon={MessageSquare} label="Semua Request" targetView="requests" />
            </>
          )}

          {activeUser.role === 'vendor' && (
            <>
              <MenuItem icon={Package} label="Produk Saya" targetView="my_products" />
              <MenuItem icon={MessageSquare} label="Market Request" targetView="market_requests" />
              <MenuItem icon={CheckCircle} label="Pesanan Masuk" targetView="vendor_orders" />
            </>
          )}

          {activeUser.role === 'user' && (
            <>
              <MenuItem icon={ShoppingBag} label="Belanja Produk" targetView="marketplace" />
              <MenuItem icon={ShoppingCart} label="Keranjang" targetView="cart" />
              <MenuItem icon={MessageSquare} label="Request Saya" targetView="my_requests" />
              <MenuItem icon={CheckCircle} label="Riwayat Transaksi" targetView="my_orders" />
            </>
          )}
        </div>
      </div>
    );
  };

  // --- VIEWS ---

  const CartView = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center"><ShoppingCart className="mr-2"/> Keranjang Belanja</h2>
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Keranjang Anda masih kosong.</p>
            <button onClick={()=>setView('marketplace')} className="mt-4 text-teal-600 font-bold hover:underline">Mulai Belanja</button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              {cart.map(item => (
                <div key={item.cartId} className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold">{item.name}</h3>
                    <div className="text-xs text-gray-500 space-x-2 mt-1">
                        <span className="bg-gray-100 px-2 py-1 rounded">Varian: {item.variant}</span>
                        {item.note && <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Note: {item.note}</span>}
                    </div>
                    <p className="text-teal-600 font-bold mt-1">{formatRupiah(item.price)} x {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-lg">{formatRupiah(item.price * item.qty)}</p>
                    <button onClick={() => removeFromCart(item.cartId)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-24">
                <h3 className="font-bold text-lg mb-4">Ringkasan Belanja</h3>
                <div className="flex justify-between mb-2 text-gray-600">
                   <span>Total Item</span>
                   <span>{cart.reduce((acc, item) => acc + item.qty, 0)} pcs</span>
                </div>
                <div className="flex justify-between mb-6 text-xl font-bold text-gray-800 border-t pt-4">
                   <span>Total Harga</span>
                   <span>{formatRupiah(getCartTotal())}</span>
                </div>
                <button 
                  onClick={() => { setModalContent(<CheckoutModal onClose={()=>setModalOpen(false)} />); setModalOpen(true); }}
                  className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 shadow-lg transition"
                >
                  Checkout Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Marketplace = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Katalog Produk Wisata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div 
              key={p.id} 
              onClick={() => { setModalContent(<ProductDetailModal product={p} onClose={()=>setModalOpen(false)} />); setModalOpen(true); }}
              className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition cursor-pointer group"
            >
              <div className="relative">
                <img src={p.image} alt={p.name} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-teal-800 shadow">Stok: {p.stock}</span>
              </div>
              <div className="p-4">
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded mb-2 inline-block">{p.category}</span>
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.desc}</p>
                <div className="flex items-center text-gray-500 text-xs mb-4">
                  <Briefcase size={12} className="mr-1" /> {p.vendorName}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-800">{formatRupiah(p.price)}</span>
                  <button className="bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-sm font-bold group-hover:bg-teal-600 group-hover:text-white transition">
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const OrderHistory = () => {
     const myOrders = orders.filter(o => activeUser.role === 'vendor' ? o.vendorId === activeUser.id : o.buyerId === activeUser.id);
     
     const handleUpdateStatus = (orderId, newStatus) => {
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        setModalContent(<AlertModal title="Status Diperbarui" message="Status pesanan berhasil diubah." onClose={()=>setModalOpen(false)} />);
        setModalOpen(true);
     };

     const getStatusBadge = (status) => {
        switch(status) {
           case 'pending_verification': return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu Verifikasi' };
           case 'diproses': return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sedang Diproses' };
           case 'selesai': return { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai' };
           case 'confirmed': return { bg: 'bg-green-100', text: 'text-green-700', label: 'Dikonfirmasi' }; // From offers
           default: return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
        }
     };

     return (
        <div className="space-y-6">
           <h2 className="text-2xl font-bold">Riwayat Transaksi</h2>
           <div className="bg-white shadow-sm rounded-xl overflow-hidden">
             {myOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Belum ada transaksi.</div>
             ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                        <tr>
                        <th className="p-4">Produk</th>
                        <th className="p-4">Detail</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Pembayaran</th>
                        <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myOrders.map(o => {
                          const badge = getStatusBadge(o.status);
                          return (
                          <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="p-4">
                                <p className="font-bold text-gray-800">{o.itemName}</p>
                                <p className="text-xs text-gray-500">{activeUser.role === 'vendor' ? `Buyer: ${o.buyerName}` : `Vendor: ${o.vendorName}`}</p>
                            </td>
                            <td className="p-4 text-sm">
                                <p>Qty: <b>{o.quantity}</b></p>
                                <p>Var: {o.variant}</p>
                                {o.note && <p className="text-gray-500 italic text-xs">"{o.note}"</p>}
                            </td>
                            <td className="p-4 font-bold text-teal-700">{formatRupiah(o.totalPrice)}</td>
                            <td className="p-4 text-sm">
                                <p>{o.paymentMethod}</p>
                                {o.paymentProof && (
                                    <button 
                                        onClick={() => {setModalContent(<ImageViewModal src={o.paymentProof} alt="Bukti" onClose={()=>setModalOpen(false)}/>); setModalOpen(true);}}
                                        className="text-teal-600 hover:underline flex items-center mt-1 text-xs"
                                    >
                                        <FileText size={12} className="mr-1"/> Lihat Bukti
                                    </button>
                                )}
                            </td>
                            <td className="p-4 align-top">
                                <div className="flex flex-col items-start gap-2">
                                  <span className={`${badge.bg} ${badge.text} px-2 py-1 rounded text-xs font-bold uppercase`}>
                                      {badge.label}
                                  </span>
                                  
                                  {/* VENDOR ACTIONS */}
                                  {activeUser.role === 'vendor' && o.status === 'pending_verification' && (
                                     <button 
                                        onClick={() => handleUpdateStatus(o.id, 'diproses')}
                                        className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 flex items-center shadow-sm"
                                     >
                                        <PlayCircle size={12} className="mr-1"/> Proses Order
                                     </button>
                                  )}
                                  {activeUser.role === 'vendor' && o.status === 'diproses' && (
                                     <button 
                                        onClick={() => handleUpdateStatus(o.id, 'selesai')}
                                        className="bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700 flex items-center shadow-sm"
                                     >
                                        <CheckSquare size={12} className="mr-1"/> Selesaikan
                                     </button>
                                  )}
                                </div>
                            </td>
                        </tr>
                        )})}
                    </tbody>
                    </table>
                </div>
             )}
           </div>
        </div>
     );
  };

  // --- RESTORED COMPLEX VIEWS (VENDOR & USER) ---

  const VendorMarketRequests = () => {
    const marketRequests = requests.filter(r => r.status === 'open');
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Permintaan Konsumen (Tender)</h2>
        <div className="grid grid-cols-1 gap-4">
          {marketRequests.length === 0 ? <p className="text-gray-500">Belum ada request aktif.</p> : 
            marketRequests.map(req => {
              const myOffer = offers.find(o => o.requestId === req.id && o.vendorId === activeUser.id);
              return (
                <div key={req.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold">Budget: {formatRupiah(req.budget)}</span>
                      <span className="text-gray-400 text-xs">{req.date}</span>
                    </div>
                    <h3 className="font-bold text-lg">{req.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{req.desc}</p>
                    <p className="text-xs text-gray-400 mt-2">Oleh: {req.userName}</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center">
                    {myOffer ? (
                      <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 text-sm font-semibold">
                        Sudah Menawar: {formatRupiah(myOffer.price)}
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                            setModalContent(<MakeOfferModal request={req} onClose={() => setModalOpen(false)} />);
                            setModalOpen(true);
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow transition text-sm flex items-center"
                      >
                        <Plus size={16} className="mr-2" /> Ajukan Penawaran
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  };

  const UserMyRequests = () => {
    const myRequests = requests.filter(r => r.userId === activeUser.id);
    const handleAcceptOfferClick = (offer, req) => {
      setModalContent(
        <ConfirmModal 
          title="Konfirmasi Pilihan" 
          message={`Terima tawaran dari ${offer.vendorName} seharga ${formatRupiah(offer.price)}?`}
          onConfirm={() => {
              const updatedReqs = requests.map(r => r.id === req.id ? {...r, status: 'closed'} : r);
              setRequests(updatedReqs);
              const updatedOffers = offers.map(o => o.id === offer.id ? {...o, status: 'accepted'} : o);
              setOffers(updatedOffers);
              const newOrder = {
                id: generateId(), itemId: req.id, itemName: `[REQUEST] ${req.title}`,
                buyerId: activeUser.id, buyerName: activeUser.name,
                vendorId: offer.vendorId, vendorName: offer.vendorName,
                price: offer.price, totalPrice: offer.price,
                quantity: 1, variant: 'Custom Request', note: '-',
                paymentMethod: 'Custom Agreement', paymentProof: null,
                date: new Date().toLocaleDateString(), status: 'diproses' // Set directly to 'diproses' for requests
              };
              setOrders(prev => [...prev, newOrder]);
              setModalContent(<AlertModal title="Sukses" message="Selamat! Transaksi telah dibuat." onClose={() => setModalOpen(false)} />);
          }}
          onCancel={() => setModalOpen(false)}
        />
      );
      setModalOpen(true);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Request Saya</h2>
          <button 
            onClick={() => { setModalContent(<CreateRequestModal onClose={()=>setModalOpen(false)} />); setModalOpen(true); }}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-teal-700 shadow"
          >
            <Plus size={16} className="mr-2" /> Buat Request
          </button>
        </div>
        {myRequests.map(req => {
          const reqOffers = offers.filter(o => o.requestId === req.id);
          return (
            <div key={req.id} className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg flex items-center">
                    {req.title} 
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${req.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {req.status === 'open' ? 'OPEN' : 'CLOSED'}
                    </span>
                  </h3>
                  <p className="text-gray-600 mt-1">{req.desc}</p>
                  <p className="text-sm font-semibold text-teal-600 mt-2">Budget: {formatRupiah(req.budget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{reqOffers.length}</p>
                  <p className="text-xs text-gray-500">Penawaran</p>
                </div>
              </div>
              {reqOffers.length > 0 && req.status === 'open' && (
                <div className="bg-gray-50 p-4 rounded-lg mt-4 space-y-3">
                    {reqOffers.map(offer => (
                      <div key={offer.id} className="bg-white p-3 rounded border flex justify-between items-center">
                        <div>
                          <p className="font-bold text-teal-700">{offer.vendorName}</p>
                          <p className="text-sm text-gray-600">{offer.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatRupiah(offer.price)}</p>
                          <button onClick={() => handleAcceptOfferClick(offer, req)} className="bg-teal-600 text-white text-xs px-3 py-1 rounded mt-1 hover:bg-teal-700">Pilih Vendor Ini</button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // --- ADMIN VIEWS RESTORED ---

  const AdminUsers = () => (
     <div className="space-y-6">
        <h2 className="text-2xl font-bold">Kelola Pengguna</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left">Nama</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4"><span className="uppercase text-xs font-bold bg-gray-200 px-2 py-1 rounded text-gray-700">{u.role}</span></td>
                  <td className="p-4">
                    {u.role !== 'admin' && (
                      <button 
                        onClick={() => {
                           setModalContent(<ConfirmModal title="Hapus User" message={`Yakin ingin menghapus ${u.name}?`} onConfirm={() => { setUsers(users.filter(x => x.id !== u.id)); setModalOpen(false); }} onCancel={() => setModalOpen(false)} />);
                           setModalOpen(true);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center"
                      ><Trash2 size={14} className="mr-1"/> Hapus</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
     </div>
  );

  const Dashboard = () => {
    const StatCard = ({ title, value, color, icon: Icon }) => (
      <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
        <div className="flex justify-between items-start">
          <div><p className="text-gray-500 text-sm mb-1">{title}</p><h3 className="text-2xl font-bold">{value}</h3></div>
          <div className="p-2 bg-gray-50 rounded-lg"><Icon size={24} className="text-gray-600" /></div>
        </div>
      </div>
    );
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard {activeUser.role === 'vendor' ? 'Vendor' : 'User'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Transaksi" value={orders.length} color="border-blue-500" icon={ShoppingBag}/>
            <StatCard title="Produk Tersedia" value={products.length} color="border-green-500" icon={Package}/>
            <StatCard title="User Aktif" value={users.length} color="border-orange-500" icon={Users}/>
        </div>
      </div>
    );
  };

  // --- RENDER MAIN LAYOUT ---

  if (!activeUser && view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500 to-teal-800 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
           <div className="text-center mb-8">
            <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-700"><Briefcase size={32} /></div>
            <h1 className="text-2xl font-bold text-gray-800">Koperasi Pariwisata</h1>
            <p className="text-gray-500">Masuk untuk melanjutkan</p>
          </div>
          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-4">
               {loginError && <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center">{loginError}</div>}
              <input type="email" placeholder="Email" className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-teal-500" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              <input type="password" placeholder="Password" className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-teal-500" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required />
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-bold transition shadow-lg">Masuk</button>
              <p className="text-center text-sm text-gray-600 mt-4">Belum punya akun? <button type="button" onClick={() => setIsRegistering(true)} className="text-teal-600 font-bold hover:underline">Daftar</button></p>
              <div className="mt-4 text-xs text-gray-400 bg-gray-50 p-3 rounded text-center">Demo: budi@gmail.com / 123 (User) <br/> vendor@bali.id / 123 (Vendor) <br/> admin@koperasi.id / 123 (Admin)</div>
            </form>
          ) : (
             <form onSubmit={handleRegister} className="space-y-4">
                <input className="w-full px-4 py-3 border rounded-lg" placeholder="Nama Lengkap" value={regName} onChange={e=>setRegName(e.target.value)} required />
                <input type="email" className="w-full px-4 py-3 border rounded-lg" placeholder="Email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} required />
                <input type="password" className="w-full px-4 py-3 border rounded-lg" placeholder="Password" value={regPass} onChange={e=>setRegPass(e.target.value)} required />
                <select className="w-full px-4 py-3 border rounded-lg" value={regRole} onChange={e=>setRegRole(e.target.value)}><option value="user">User (Pembeli)</option><option value="vendor">Vendor (Penjual)</option></select>
                <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-bold transition shadow-lg">Daftar Sekarang</button>
                <button type="button" onClick={() => setIsRegistering(false)} className="w-full text-sm text-gray-500 mt-2">Kembali ke Login</button>
             </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />
      <div className="flex flex-1 md:pt-16">
        <Sidebar />
        <main className="flex-1 p-6 md:ml-64 mt-16 md:mt-0 overflow-x-hidden">
          
          {/* DYNAMIC VIEWS */}
          {view === 'dashboard' && <Dashboard />}
          
          {/* USER FLOW */}
          {view === 'marketplace' && activeUser.role === 'user' && <Marketplace />}
          {view === 'cart' && activeUser.role === 'user' && <CartView />}
          {view === 'my_requests' && activeUser.role === 'user' && <UserMyRequests />}
          {(view === 'my_orders' || view === 'vendor_orders') && <OrderHistory />}
          
          {/* VENDOR FLOW */}
          {view === 'market_requests' && activeUser.role === 'vendor' && <VendorMarketRequests />}
          {view === 'my_products' && activeUser.role === 'vendor' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Produk Saya</h2><button onClick={() => { setModalContent(<AddProductModal onClose={()=>setModalOpen(false)} />); setModalOpen(true); }} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-teal-700"><Plus size={16} className="mr-2" /> Tambah Produk</button></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{products.filter(p => p.vendorId === activeUser.id).map(p => (<div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border"><div className="relative"><img src={p.image} className="w-full h-40 object-cover rounded-lg mb-3"/><span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Stok: {p.stock}</span></div><h3 className="font-bold text-lg">{p.name}</h3><p className="text-teal-600 font-bold">{formatRupiah(p.price)}</p></div>))}</div>
             </div>
          )}

           {/* ADMIN VIEWS */}
           {view === 'admin_users' && activeUser.role === 'admin' && <AdminUsers />}
           {view === 'products' && activeUser.role === 'admin' && (
               <div className="space-y-6">
                   <h2 className="text-2xl font-bold">Semua Produk</h2>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{products.map(p => (<div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border"><img src={p.image} className="w-full h-40 object-cover rounded-lg mb-3"/><h3 className="font-bold text-lg">{p.name}</h3><p className="text-sm text-gray-500 mb-1">{p.vendorName}</p><p className="text-teal-600 font-bold">{formatRupiah(p.price)}</p></div>))}</div>
               </div>
           )}
           {view === 'requests' && activeUser.role === 'admin' && (
               <div className="space-y-6">
                   <h2 className="text-2xl font-bold">Semua Request</h2>
                   <div className="space-y-4">{requests.map(r => (<div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between"><div><h3 className="font-bold">{r.title}</h3><p className="text-sm text-gray-500">{r.userName}</p></div><span className={`px-2 py-1 rounded text-xs font-bold ${r.status==='open'?'bg-green-100 text-green-700':'bg-gray-200'}`}>{r.status.toUpperCase()}</span></div>))}</div>
               </div>
           )}

        </main>
      </div>

      {modalOpen && <div className="z-50 absolute">{modalContent}</div>}
    </div>
  );
}