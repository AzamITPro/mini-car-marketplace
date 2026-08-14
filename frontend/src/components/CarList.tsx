import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import type { Car, User, Rental } from '../types/car';

export const CarList = () => {
  // التبويب النشط
  const [activeTab, setActiveTab] = useState<'market' | 'myCars' | 'favorites' | 'rentals'>('market');

  // البيانات
  const [cars, setCars] = useState<Car[]>([]);
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [favoriteCars, setFavoriteCars] = useState<Car[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [myRentals, setMyRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // مفتاح تحديث البيانات
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // حالة المستخدم
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('user_info') ? JSON.parse(localStorage.getItem('user_info')!) : null
  );
  const [email, setEmail] = useState<string>('mohammed@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [registerMode, setRegisterMode] = useState<boolean>(false);
  const [regName, setRegName] = useState<string>('');
  const [regRole, setRegRole] = useState<'user' | 'dealer' | 'rental_agency'>('dealer');
  const [regShowroom, setRegShowroom] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('777123456');

  // الفلاتر المتقدمة
  const [search, setSearch] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [transmission, setTransmission] = useState<string>('');
  const [fuelType, setFuelType] = useState<string>('');
  const [bodyType, setBodyType] = useState<string>('');
  const [sellerType, setSellerType] = useState<string>('');

  // تفاصيل السيارة المنبثقة
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [rentalStart, setRentalStart] = useState<string>('');
  const [rentalEnd, setRentalEnd] = useState<string>('');
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  // التقييمات
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);

  // نموذج الإضافة والتعديل
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingCarId, setEditingCarId] = useState<number | null>(null);
  const [newBrand, setNewBrand] = useState<string>('');
  const [newModel, setNewModel] = useState<string>('');
  const [newYear, setNewYear] = useState<number>(2023);
  const [newPrice, setNewPrice] = useState<number>(22000);
  const [newTransType, setNewTransType] = useState<'sale' | 'rent'>('sale');
  const [newCondition, setNewCondition] = useState<'new' | 'used'>('new');
  const [newMileage, setNewMileage] = useState<number>(15000);
  const [newTransmission, setNewTransmission] = useState<'automatic' | 'manual'>('automatic');
  const [newFuelType, setNewFuelType] = useState<'petrol' | 'diesel' | 'hybrid' | 'electric'>('petrol');
  const [newEnginePower, setNewEnginePower] = useState<number>(190);
  const [newBodyType, setNewBodyType] = useState<'suv' | 'sedan' | 'hatchback' | 'coupe' | 'truck' | 'van'>('sedan');
  const [newCity, setNewCity] = useState<string>('صنعاء');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 1. جلب بيانات السوق
  useEffect(() => {
    let isMounted = true;

    const loadCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/cars', {
          params: {
            search: search || undefined,
            transaction_type: transactionType || undefined,
            condition: condition || undefined,
            transmission: transmission || undefined,
            fuel_type: fuelType || undefined,
            body_type: bodyType || undefined,
            seller_type: sellerType || undefined,
          },
        });
        if (isMounted) {
          setCars(response.data.data);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('تعذر الاتصال بالخادم لجلب قائمة السيارات');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void loadCars();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, transactionType, condition, transmission, fuelType, bodyType, sellerType, refreshTrigger]);

  // 2. جلب المفضلة وسيارتي وحجوزاتي بطريقة غير متزامنة آمنة
  useEffect(() => {
    let isMounted = true;

    if (!token) {
      return;
    }

    const loadUserData = async () => {
      try {
        const [favRes, myCarsRes, rentalsRes] = await Promise.all([
          api.get('/favorites', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/my-cars', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/rentals', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (isMounted) {
          const favs: Car[] = favRes.data.data;
          setFavoriteCars(favs);
          setFavoriteIds(favs.map((c) => c.id));
          setMyCars(myCarsRes.data.data);
          setMyRentals(rentalsRes.data.data);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    void loadUserData();

    return () => {
      isMounted = false;
    };
  }, [token, refreshTrigger]);

  // تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      const newToken = response.data.access_token;
      const currentUser = response.data.user;

      setToken(newToken);
      setUser(currentUser);
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('user_info', JSON.stringify(currentUser));
      setRefreshTrigger((prev) => prev + 1);
      alert(`أهلاً بك يا ${currentUser.name}! 🎉`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'فشل تسجيل الدخول');
      }
    }
  };

  // إنشاء حساب جديد
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/register', {
        name: regName,
        email,
        password,
        role: regRole,
        showroom_name: regShowroom || undefined,
        phone: regPhone,
      });
      const newToken = response.data.access_token;
      const currentUser = response.data.user;

      setToken(newToken);
      setUser(currentUser);
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('user_info', JSON.stringify(currentUser));
      setRegisterMode(false);
      setRefreshTrigger((prev) => prev + 1);
      alert('تم إنشاء الحساب بنجاح! 🎉');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'فشل إنشاء الحساب');
      }
    }
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    try {
      if (token) {
        await api.post('/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToken(null);
      setUser(null);
      setFavoriteCars([]);
      setFavoriteIds([]);
      setMyCars([]);
      setMyRentals([]);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      setActiveTab('market');
    }
  };

  // تبديل المفضلة
  const handleToggleFavorite = async (carId: number) => {
    if (!token) {
      alert('يرجى تسجيل الدخول أولاً لتتمكن من حفظ السيارة في المفضلة 🔒');
      return;
    }
    try {
      const response = await api.post(
        `/favorites/toggle/${carId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }
      );
      const isFavorited: boolean = response.data.is_favorited;
      if (isFavorited) {
        setFavoriteIds((prev) => [...prev, carId]);
      } else {
        setFavoriteIds((prev) => prev.filter((id) => id !== carId));
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || err.message);
      }
    }
  };

  // إضافة أو تعديل سيارة
  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('brand', newBrand);
    formData.append('model', newModel);
    formData.append('year', newYear.toString());
    formData.append('price', newPrice.toString());
    formData.append('transaction_type', newTransType);
    formData.append('condition', newCondition);
    formData.append('mileage', newMileage.toString());
    formData.append('transmission', newTransmission);
    formData.append('fuel_type', newFuelType);
    formData.append('engine_power', newEnginePower.toString());
    formData.append('body_type', newBodyType);
    formData.append('city', newCity);
    if (newDescription) formData.append('description', newDescription);
    if (newImage) formData.append('image', newImage);

    try {
      if (editingCarId) {
        formData.append('_method', 'PUT');
        await api.post(`/cars/${editingCarId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        alert('تم تعديل بيانات السيارة بنجاح! ✏️');
      } else {
        await api.post('/cars', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        alert('تم نشر السيارة بنجاح في السوق! 🚗✨');
      }
      setShowAddModal(false);
      setEditingCarId(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'حدث خطأ أثناء حفظ السيارة');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // بدء تعديل سيارة
  const startEditCar = (car: Car) => {
    setEditingCarId(car.id);
    setNewBrand(car.brand);
    setNewModel(car.model);
    setNewYear(car.year);
    setNewPrice(car.price);
    setNewTransType(car.transaction_type);
    setNewCondition(car.condition);
    setNewMileage(car.mileage || 0);
    setNewTransmission(car.transmission || 'automatic');
    setNewFuelType(car.fuel_type || 'petrol');
    setNewEnginePower(car.engine_power || 150);
    setNewBodyType(car.body_type || 'sedan');
    setNewCity(car.city);
    setNewDescription(car.description || '');
    setNewImage(null);
    setShowAddModal(true);
  };

  // حذف سيارة
  const handleDeleteCar = async (carId: number) => {
    if (!token) return;
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الإعلان نهائياً؟')) return;

    try {
      await api.delete(`/cars/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('تم حذف السيارة بنجاح 🗑️');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'فشل حذف السيارة');
      }
    }
  };

  // حجز سيارة للتأجير
  const handleBookCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('يرجى تسجيل الدخول أولاً لتتمكن من إتمام الحجز 🔒');
      return;
    }
    if (!selectedCar) return;

    setBookingLoading(true);
    try {
      const response = await api.post(
        '/rentals',
        {
          car_id: selectedCar.id,
          start_date: rentalStart,
          end_date: rentalEnd,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message);
      setSelectedCar(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'تعذر حجز السيارة');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // إلغاء حجز
  const handleCancelRental = async (rentalId: number) => {
    if (!token) return;
    if (!window.confirm('هل تريد بالتأكيد إلغاء هذا الحجز؟')) return;

    try {
      await api.post(`/rentals/${rentalId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('تم إلغاء الحجز بنجاح');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'فشل إلغاء الحجز');
      }
    }
  };

  // تقييم المعرض
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('يرجى تسجيل الدخول أولاً لإرسال تقييمك');
      return;
    }
    if (!selectedCar || !selectedCar.user) return;

    setReviewSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        dealer_id: selectedCar.user_id,
        car_id: selectedCar.id,
        rating: reviewRating,
        comment: reviewComment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      setReviewComment('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'فشل تسجيل التقييم');
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getRoleBadge = (role: string, showroomName?: string) => {
    switch (role) {
      case 'dealer':
        return <span style={{ backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' }}>🏢 معرض معتمد: {showroomName || 'معرض سيارات'}</span>;
      case 'rental_agency':
        return <span style={{ backgroundColor: '#f3e5f5', color: '#4a148c', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' }}>🔑 مكتب تأجير: {showroomName || 'مكتب تأجير'}</span>;
      case 'admin':
        return <span style={{ backgroundColor: '#ffebee', color: '#b71c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' }}>🛡️ مدير المنصة</span>;
      default:
        return <span style={{ backgroundColor: '#e8f5e9', color: '#1b5e20', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em' }}>👤 بائع فردي / عميل</span>;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* 1. الشريط العلوي وإدارة الحساب */}
      <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        {user ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.05em' }}>مرحباً بك، <strong>{user.name}</strong></span>
              {getRoleBadge(user.role, user.showroom_name)}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setEditingCarId(null); setShowAddModal(true); }}
                style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ➕ نشر سيارة
              </button>
              <button
                onClick={handleLogout}
                style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}
              >
                تسجيل الخروج 🚪
              </button>
            </div>
          </div>
        ) : registerMode ? (
          <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'center' }}>
            <input type="text" placeholder="الاسم الكامل" value={regName} onChange={(e) => setRegName(e.target.value)} required style={{ padding: '6px' }} />
            <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '6px' }} />
            <input type="password" placeholder="كلمة المرور (8 أحرف)" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '6px' }} />
            <select value={regRole} onChange={(e) => setRegRole(e.target.value as 'user' | 'dealer' | 'rental_agency')} style={{ padding: '6px' }}>
              <option value="user">👤 عميل / بائع فردي</option>
              <option value="dealer">🏢 صاحب معرض سيارات</option>
              <option value="rental_agency">🔑 صاحب مكتب تأجير</option>
            </select>
            {regRole !== 'user' && (
              <input type="text" placeholder="اسم المعرض أو المكتب" value={regShowroom} onChange={(e) => setRegShowroom(e.target.value)} style={{ padding: '6px' }} />
            )}
            <input type="text" placeholder="رقم الهاتف للتواصل" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} style={{ padding: '6px' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer' }}>تأكيد التسجيل 📝</button>
              <button type="button" onClick={() => setRegisterMode(false)} style={{ background: 'none', border: '1px solid #999', padding: '8px', cursor: 'pointer' }}>دخول</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>🔒 تسجيل الدخول:</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد" required style={{ padding: '6px' }} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" required style={{ padding: '6px' }} />
            <button type="submit" style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>دخول 🚀</button>
            <button type="button" onClick={() => setRegisterMode(true)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>ليس لديك حساب؟ سجل الآن</button>
          </form>
        )}
      </div>

      {/* 2. شريط التبويبات (Navigation Tabs) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('market')}
          style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'market' ? '#1a73e8' : '#fff', color: activeTab === 'market' ? '#fff' : '#333' }}
        >
          🚗 السوق العام
        </button>
        {user && (
          <>
            <button
              onClick={() => setActiveTab('myCars')}
              style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'myCars' ? '#1a73e8' : '#fff', color: activeTab === 'myCars' ? '#fff' : '#333' }}
            >
              🏢 سياراتي وإدارتها ({myCars.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'favorites' ? '#1a73e8' : '#fff', color: activeTab === 'favorites' ? '#fff' : '#333' }}
            >
              ❤️ المفضلة ({favoriteCars.length})
            </button>
            <button
              onClick={() => setActiveTab('rentals')}
              style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'rentals' ? '#1a73e8' : '#fff', color: activeTab === 'rentals' ? '#fff' : '#333' }}
            >
              📋 حجوزاتي ({myRentals.length})
            </button>
          </>
        )}
      </div>

      {/* 3. شريط الفلاتر المتقدمة */}
      {activeTab === 'market' && (
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', marginBottom: '25px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            <input type="text" placeholder="🔍 بحث بالاسم، الموديل، المدينة..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="">جميع العمليات (بيع/تأجير)</option>
              <option value="sale">بيع 🏷️</option>
              <option value="rent">تأجير 🔑</option>
            </select>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="">جميع الحالات</option>
              <option value="new">جديدة ✨</option>
              <option value="used">مستعملة 🛠️</option>
            </select>
            <select value={transmission} onChange={(e) => setTransmission(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="">نوع القير (الكل)</option>
              <option value="automatic">أوتوماتيك ⚙️</option>
              <option value="manual">عادي / يدوي 🕹️</option>
            </select>
            <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="">نوع الوقود (الكل)</option>
              <option value="petrol">بنزين ⛽</option>
              <option value="diesel">ديزل 🛢️</option>
              <option value="hybrid">هايبرد 🔋</option>
              <option value="electric">كهربائي ⚡</option>
            </select>
            <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="">نوع الهيكل (الكل)</option>
              <option value="sedan">سيدان</option>
              <option value="suv">SUV</option>
              <option value="hatchback">هاتشباك</option>
              <option value="coupe">كوبيه</option>
              <option value="truck">بيك آب</option>
            </select>
            <select value={sellerType} onChange={(e) => setSellerType(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="">نوع البائع (الكل)</option>
              <option value="dealer">🏢 معارض معتمدة فقط</option>
              <option value="private">👤 بائعون أفراد فقط</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. نموذج الإضافة / التعديل */}
      {showAddModal && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '2px solid #007bff', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#007bff' }}>{editingCarId ? '✏️ تعديل بيانات السيارة' : '🚗 نشر سيارة جديدة بالمواصفات الكاملة'}</h3>
          <form onSubmit={handleSaveCar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div><label>الشركة:</label><input type="text" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} required style={{ width: '100%', padding: '6px' }} /></div>
            <div><label>الموديل:</label><input type="text" value={newModel} onChange={(e) => setNewModel(e.target.value)} required style={{ width: '100%', padding: '6px' }} /></div>
            <div><label>السنة:</label><input type="number" value={newYear} onChange={(e) => setNewYear(Number(e.target.value))} required style={{ width: '100%', padding: '6px' }} /></div>
            <div><label>السعر ($):</label><input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} required style={{ width: '100%', padding: '6px' }} /></div>
            <div><label>العداد (كم):</label><input type="number" value={newMileage} onChange={(e) => setNewMileage(Number(e.target.value))} style={{ width: '100%', padding: '6px' }} /></div>
            <div><label>قوة المحرك (HP):</label><input type="number" value={newEnginePower} onChange={(e) => setNewEnginePower(Number(e.target.value))} style={{ width: '100%', padding: '6px' }} /></div>
            <div><label>العملية:</label><select value={newTransType} onChange={(e) => setNewTransType(e.target.value as 'sale' | 'rent')} style={{ width: '100%', padding: '6px' }}><option value="sale">بيع</option><option value="rent">تأجير</option></select></div>
            <div><label>القير:</label><select value={newTransmission} onChange={(e) => setNewTransmission(e.target.value as 'automatic' | 'manual')} style={{ width: '100%', padding: '6px' }}><option value="automatic">أوتوماتيك</option><option value="manual">يدوي</option></select></div>
            <div><label>الوقود:</label><select value={newFuelType} onChange={(e) => setNewFuelType(e.target.value as 'petrol' | 'diesel' | 'hybrid' | 'electric')} style={{ width: '100%', padding: '6px' }}><option value="petrol">بنزين</option><option value="diesel">ديزل</option><option value="hybrid">هايبرد</option><option value="electric">كهربائي</option></select></div>
            <div><label>الهيكل:</label><select value={newBodyType} onChange={(e) => setNewBodyType(e.target.value as 'suv' | 'sedan' | 'hatchback' | 'coupe' | 'truck' | 'van')} style={{ width: '100%', padding: '6px' }}><option value="sedan">سيدان</option><option value="suv">SUV</option><option value="hatchback">هاتشباك</option><option value="coupe">كوبيه</option><option value="truck">بيك آب</option></select></div>
            <div><label>المدينة:</label><input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} required style={{ width: '100%', padding: '6px' }} /></div>
            <div><label>الصورة 📸:</label><input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)} style={{ width: '100%' }} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label>الوصف والملاحظات:</label><textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={2} style={{ width: '100%', padding: '6px' }} /></div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={submitting} style={{ backgroundColor: '#28a745', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{submitting ? 'جاري الحفظ...' : 'حفظ ونشر 🚀'}</button>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ backgroundColor: '#6c757d', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* مؤشر التحميل والأخطاء */}
      {loading && <div style={{ textAlign: 'center', padding: '15px', fontSize: '1.1em' }}>جاري تحميل السيارات... 🚗</div>}
      {error && <div style={{ color: 'red', textAlign: 'center', padding: '10px' }}>{error}</div>}

      {/* 5. عرض محتوى التبويب النشط */}
      {activeTab === 'rentals' ? (
        <div>
          <h2>📋 قائمة حجوزاتي</h2>
          {myRentals.length === 0 ? <p>لا توجد لديك أي حجوزات حالية.</p> : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {myRentals.map((r) => (
                <div key={r.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>{r.car?.brand} {r.car?.model} ({r.car?.year})</h4>
                    <p style={{ margin: '3px 0' }}><strong>الفترة:</strong> من {r.start_date} إلى {r.end_date}</p>
                    <p style={{ margin: '3px 0' }}><strong>الإجمالي:</strong> ${r.total_price} | <strong>الحالة:</strong> <span style={{ color: r.status === 'confirmed' ? 'green' : 'red' }}>{r.status === 'confirmed' ? 'مؤكد ✓' : 'ملغي ✗'}</span></p>
                  </div>
                  {r.status === 'confirmed' && (
                    <button onClick={() => handleCancelRental(r.id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>إلغاء الحجز ✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
          {(activeTab === 'myCars' ? myCars : activeTab === 'favorites' ? favoriteCars : cars).map((car) => {
            const isFav = favoriteIds.includes(car.id);
            const isOwner = user && user.id === car.user_id;

            return (
              <div key={car.id} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '14px', backgroundColor: '#fff', boxShadow: '0 3px 8px rgba(0,0,0,0.06)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* زر المفضلة */}
                  <button
                    onClick={() => handleToggleFavorite(car.id)}
                    style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', zIndex: 2, fontSize: '1.2em' }}
                  >
                    {isFav ? '❤️' : '🤍'}
                  </button>

                  {/* صورة السيارة */}
                  {car.image_url ? (
                    <img src={`http://127.0.0.1:8000${car.image_url}`} alt={car.model} style={{ width: '100%', height: '170px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                  ) : (
                    <div style={{ width: '100%', height: '140px', backgroundColor: '#e9ecef', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5em' }}>🚗</div>
                  )}

                  {/* تفاصيل البائع وشارة المعرض */}
                  <div style={{ marginBottom: '8px' }}>
                    {car.user && getRoleBadge(car.user.role, car.user.showroom_name)}
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', color: '#1a73e8' }}>{car.brand} - {car.model}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#28a745' }}>${car.price} {car.transaction_type === 'rent' && <small style={{ fontSize: '0.6em', color: '#666' }}>/ يوم</small>}</span>
                    <span style={{ fontSize: '0.85em', color: '#666' }}>سنة {car.year}</span>
                    {car.price_rating && (
                      <span
                         style={{
                          backgroundColor: car.price_rating.bg,
                          color: car.price_rating.color,
                          padding: '3px 8px',
                          borderRadius: '20px',
                          fontSize: '0.78em',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          }}
    > 
      {car.price_rating.icon} {car.price_rating.label}
    </span>
  )}
                  </div>

                  {/* شبكة المواصفات السريعة بأسلوب mobile.de */}
                  <div style={{ backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '6px', fontSize: '0.85em', marginBottom: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    <span>⚙️ {car.transmission === 'automatic' ? 'أوتوماتيك' : 'عادي'}</span>
                    <span>⛽ {car.fuel_type || 'بنزين'}</span>
                    <span>🛣️ {car.mileage ? `${car.mileage.toLocaleString()} كم` : 'جديدة'}</span>
                    <span>📍 {car.city}</span>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <button
                    onClick={() => setSelectedCar(car)}
                    style={{ flex: 1, backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    عرض التفاصيل 🔍
                  </button>

                  {/* أزرار المالك (تعديل وحذف) */}
                  {isOwner && (
                    <>
                      <button onClick={() => startEditCar(car)} style={{ backgroundColor: '#ffc107', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }} title="تعديل">✏️</button>
                      <button onClick={() => handleDeleteCar(car.id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }} title="حذف">🗑️</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. نافذة تفاصيل السيارة المنبثقة الكاملة (Car Details Modal) */}
      {selectedCar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative' }}>
            <button onClick={() => setSelectedCar(null)} style={{ position: 'absolute', top: '15px', left: '15px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1em' }}>✕</button>

            <h2 style={{ color: '#1a73e8', marginTop: 0 }}>{selectedCar.brand} - {selectedCar.model} ({selectedCar.year})</h2>

            {selectedCar.image_url && (
              <img src={`http://127.0.0.1:8000${selectedCar.image_url}`} alt={selectedCar.model} style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px' }} />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
              <div><strong>السعر:</strong> <span style={{ color: '#28a745', fontSize: '1.2em', fontWeight: 'bold' }}>${selectedCar.price} {selectedCar.transaction_type === 'rent' && '/ يوم'}</span></div>
              <div><strong>العداد:</strong> {selectedCar.mileage ? `${selectedCar.mileage.toLocaleString()} كم` : '0 كم'}</div>
              <div><strong>القير:</strong> {selectedCar.transmission === 'automatic' ? 'أوتوماتيك' : 'يدوي'}</div>
              <div><strong>الوقود:</strong> {selectedCar.fuel_type}</div>
              <div><strong>القوة:</strong> {selectedCar.engine_power ? `${selectedCar.engine_power} HP` : 'غير محدد'}</div>
              <div><strong>الهيكل:</strong> {selectedCar.body_type}</div>
              <div><strong>المدينة:</strong> {selectedCar.city}</div>
              <div><strong>الحالة:</strong> {selectedCar.condition === 'new' ? 'جديدة' : 'مستعملة'}</div>
            </div>

            {selectedCar.description && (
              <div style={{ marginBottom: '15px' }}>
                <h4>وصف وملاحظات البائع:</h4>
                <p style={{ color: '#555', lineHeight: '1.6' }}>{selectedCar.description}</p>
              </div>
            )}

            {/* بطاقة البائع والتواصل */}
            {selectedCar.user && (
              <div style={{ backgroundColor: '#e3f2fd', padding: '14px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4>معلومات البائع:</h4>
                <p style={{ margin: '4px 0' }}><strong>الاسم / المعرض:</strong> {selectedCar.user.showroom_name || selectedCar.user.name}</p>
                {selectedCar.user.phone && (
                  <p style={{ margin: '4px 0' }}><strong>رقم الهاتف:</strong> {selectedCar.user.phone}</p>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {selectedCar.user.phone && (
                    <a href={`https://wa.me/${selectedCar.user.phone}`} target="_blank" rel="noreferrer" style={{ backgroundColor: '#25D366', color: '#fff', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                      واتساب 💬
                    </a>
                  )}
                  {selectedCar.user.phone && (
                    <a href={`tel:${selectedCar.user.phone}`} style={{ backgroundColor: '#007bff', color: '#fff', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                      اتصال 📞
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* نموذج إضافة تقييم بالنجوم */}
            {user && user.id !== selectedCar.user_id && (
              <div style={{ backgroundColor: '#fff3cd', padding: '14px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>⭐ تقييم هذا البائع / المعرض:</h4>
                <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label>درجة التقييم:</label>
                    <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} style={{ padding: '4px 8px', borderRadius: '4px' }}>
                      <option value={5}>⭐⭐⭐⭐⭐ (5 من 5 ممتاز جداً)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 من 5 جيد جداً)</option>
                      <option value={3}>⭐⭐⭐ (3 من 5 جيد)</option>
                      <option value={2}>⭐⭐ (2 من 5 مقبول)</option>
                      <option value={1}>⭐ (1 من 5 ضعيف)</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="اكتب رأيك وتجربتك مع المعرض (اختياري)..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    style={{ alignSelf: 'flex-start', backgroundColor: '#ffc107', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {reviewSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم ⭐'}
                  </button>
                </form>
              </div>
            )}

            {/* نموذج الحجز الفوري لسيارات التأجير */}
            {selectedCar.transaction_type === 'rent' && (
              <div style={{ borderTop: '2px solid #eee', paddingTop: '15px' }}>
                <h4 style={{ color: '#4a148c' }}>🔑 حجز هذه السيارة للتأجير:</h4>
                <form onSubmit={handleBookCar} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '0.85em' }}>من تاريخ:</label>
                    <input type="date" value={rentalStart} onChange={(e) => setRentalStart(e.target.value)} required style={{ padding: '6px', display: 'block' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85em' }}>إلى تاريخ:</label>
                    <input type="date" value={rentalEnd} onChange={(e) => setRentalEnd(e.target.value)} required style={{ padding: '6px', display: 'block' }} />
                  </div>
                  <button type="submit" disabled={bookingLoading} style={{ backgroundColor: '#4a148c', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-end' }}>
                    {bookingLoading ? 'جاري التأكيد...' : 'تأكيد الحجز الفوري 🚀'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};