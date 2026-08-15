import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import type { Car, User, Rental, Dealer, DealerVerification } from '../types/car';

export const CarList = () => {
  // التبويب النشط
  const [activeTab, setActiveTab] = useState<'market' | 'dealers' | 'myCars' | 'partnerHub' | 'adminHub' | 'favorites' | 'rentals'>('market');

  // البيانات
  const [cars, setCars] = useState<Car[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [favoriteCars, setFavoriteCars] = useState<Car[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [myRentals, setMyRentals] = useState<Rental[]>([]);
  const [verifications, setVerifications] = useState<DealerVerification[]>([]);
  const [myVerificationStatus, setMyVerificationStatus] = useState<DealerVerification | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // قائمة المقارنة
  const [compareCars, setCompareCars] = useState<Car[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // مفتاح التحديث التلقائي
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

  // نموذج توثيق المعرض
  const [commFile, setCommFile] = useState<File | null>(null);
  const [licFile, setLicFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showroomAddress, setShowroomAddress] = useState<string>('شارع الستين الجنوبي، صنعاء');
  const [verifSubmitting, setVerifSubmitting] = useState<boolean>(false);

  // نموذج إضافة وتعديل السيارة بالمواصفات الشاملة
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingCarId, setEditingCarId] = useState<number | null>(null);
  const [newBrand, setNewBrand] = useState<string>('');
  const [newModel, setNewModel] = useState<string>('');
  const [newVin, setNewVin] = useState<string>('');
  const [newYear, setNewYear] = useState<number>(2023);
  const [newPrice, setNewPrice] = useState<number>(22000);
  const [newTransType, setNewTransType] = useState<'sale' | 'rent'>('sale');
  const [newCondition, setNewCondition] = useState<'new' | 'used'>('new');
  const [newMileage, setNewMileage] = useState<number>(15000);
  const [newOwnersCount, setNewOwnersCount] = useState<number>(1);
  const [newAccidentFree, setNewAccidentFree] = useState<boolean>(true);
  const [newServiceHistory, setNewServiceHistory] = useState<boolean>(true);
  const [newWarrantyMonths, setNewWarrantyMonths] = useState<number>(12);
  const [newTuvDate, setNewTuvDate] = useState<string>('2027-05-01');
  const [newTransmission, setNewTransmission] = useState<'automatic' | 'manual'>('automatic');
  const [newFuelType, setNewFuelType] = useState<'petrol' | 'diesel' | 'hybrid' | 'electric'>('petrol');
  const [newEnginePower, setNewEnginePower] = useState<number>(190);
  const [newBodyType, setNewBodyType] = useState<'suv' | 'sedan' | 'hatchback' | 'coupe' | 'truck' | 'van'>('sedan');
  const [newCity, setNewCity] = useState<string>('صنعاء');
  const [newDescription, setNewDescription] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['نظام ملاحة GPS', 'كاميرا 360', 'مقاعد جلد']);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const availableFeatures = [
    'نظام ملاحة GPS', 'فتحة سقف بانوراما', 'كاميرا 360', 'مقاعد جلد فاخرة',
    'تدفئة وتبريد مقاعد', 'إضاءة Matrix LED', 'رادار النقطة العمياء',
    'مثبت سرعة تفاعلي', 'تشغيل ذكي بدون مفتاح', 'أبل كاربلاي / أندرويد أوتو'
  ];

  // 1. جلب بيانات السوق العام
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
        if (isMounted) setCars(response.data.data);
      } catch (err) {
        console.error(err);
        if (isMounted) setError('تعذر الاتصال بالخادم لجلب قائمة السيارات');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => { void loadCars(); }, 300);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [search, transactionType, condition, transmission, fuelType, bodyType, sellerType, refreshTrigger]);

  // 2. جلب قائمة المعارض المعتمدة
  useEffect(() => {
    let isMounted = true;
    const loadDealers = async () => {
      try {
        const response = await api.get('/dealers');
        if (isMounted) setDealers(response.data.data);
      } catch (err) {
        console.error('Error loading dealers:', err);
      }
    };
    void loadDealers();
    return () => { isMounted = false; };
  }, [refreshTrigger]);

  // 3. جلب بيانات المستخدم الموثق وإدارة التوثيق بأمان
  useEffect(() => {
    let isMounted = true;

    if (!token) {
      return;
    }

    const loadUserData = async () => {
      try {
        const [favRes, myCarsRes, rentalsRes, verifRes] = await Promise.all([
          api.get('/favorites', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/my-cars', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/rentals', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/dealer/verify/status', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (isMounted) {
          setFavoriteCars(favRes.data.data);
          setFavoriteIds(favRes.data.data.map((c: Car) => c.id));
          setMyCars(myCarsRes.data.data);
          setMyRentals(rentalsRes.data.data);
          setMyVerificationStatus(verifRes.data.verification);
        }

        if (user?.role === 'admin') {
          const adminVerifRes = await api.get('/admin/verifications', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (isMounted) {
            setVerifications(adminVerifRes.data.data);
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    void loadUserData();

    return () => {
      isMounted = false;
    };
  }, [token, user?.role, refreshTrigger]);

  // فتح صفحة معرض محدد
  const openDealerStorefront = async (dealerId: number) => {
    try {
      const res = await api.get(`/dealers/${dealerId}`);
      setSelectedDealer(res.data.data);
    } catch (err) {
      console.error(err);
      alert('تعذر فتح صفحة المعرض');
    }
  };

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
      alert(`مرحباً بك مجدداً يا ${currentUser.name}! 🎉`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'فشل تسجيل الدخول');
      }
    }
  };

  // تسجيل حساب جديد
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
      if (token) await api.post('/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error(err);
    } finally {
      setToken(null);
      setUser(null);
      setFavoriteCars([]);
      setFavoriteIds([]);
      setMyCars([]);
      setMyRentals([]);
      setMyVerificationStatus(null);
      setVerifications([]);
      setCompareCars([]);
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
      const response = await api.post(`/favorites/toggle/${carId}`, {}, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const isFavorited: boolean = response.data.is_favorited;
      if (isFavorited) {
        setFavoriteIds((prev) => [...prev, carId]);
      } else {
        setFavoriteIds((prev) => prev.filter((id) => id !== carId));
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || err.message);
    }
  };

  // تبديل المقارنة
  const toggleCompare = (car: Car) => {
    if (compareCars.some((c) => c.id === car.id)) {
      setCompareCars((prev) => prev.filter((c) => c.id !== car.id));
    } else {
      if (compareCars.length >= 3) {
        alert('يمكنك مقارنة 3 سيارات كحد أقصى في نفس الوقت');
        return;
      }
      setCompareCars((prev) => [...prev, car]);
    }
  };

  // تبديل كماليات السيارة
  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures((prev) => prev.filter((f) => f !== feat));
    } else {
      setSelectedFeatures((prev) => [...prev, feat]);
    }
  };

  // تقديم طلب توثيق المعرض
  const handleApplyVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !commFile || !licFile || !idFile) {
      alert('يرجى رفع كافة الوثائق المطلوبة (السجل التجاري، الرخصة، والهوية)');
      return;
    }

    setVerifSubmitting(true);
    const formData = new FormData();
    formData.append('commercial_record', commFile);
    formData.append('license_document', licFile);
    formData.append('national_id_document', idFile);
    formData.append('showroom_address', showroomAddress);
    if (photoFile) formData.append('showroom_photo', photoFile);

    try {
      const res = await api.post('/dealer/verify/apply', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      alert(res.data.message);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'فشل إرسال طلب التوثيق');
    } finally {
      setVerifSubmitting(false);
    }
  };

  // [Admin] اعتماد أو رفض معرض
  const handleAdminDecision = async (id: number, decision: 'approve' | 'reject') => {
    if (!token) return;
    try {
      if (decision === 'approve') {
        const res = await api.post(`/admin/verifications/${id}/approve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(res.data.message);
      } else {
        const reason = prompt('سبب رفض طلب التوثيق:') || 'الوثائق غير مكتملة أو غير واضحة';
        const res = await api.post(`/admin/verifications/${id}/reject`, { reason }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(res.data.message);
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'حدث خطأ');
    }
  };

  // إضافة أو تعديل سيارة بالمواصفات الألمانية الشاملة
  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { alert('يجب تسجيل الدخول أولاً'); return; }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('brand', newBrand);
    formData.append('model', newModel);
    if (newVin) formData.append('vin', newVin);
    formData.append('year', newYear.toString());
    formData.append('price', newPrice.toString());
    formData.append('transaction_type', newTransType);
    formData.append('condition', newCondition);
    formData.append('mileage', newMileage.toString());
    formData.append('owners_count', newOwnersCount.toString());
    formData.append('is_accident_free', newAccidentFree ? '1' : '0');
    formData.append('has_service_history', newServiceHistory ? '1' : '0');
    formData.append('warranty_months', newWarrantyMonths.toString());
    if (newTuvDate) formData.append('tuv_valid_until', newTuvDate);
    formData.append('transmission', newTransmission);
    formData.append('fuel_type', newFuelType);
    formData.append('engine_power', newEnginePower.toString());
    formData.append('body_type', newBodyType);
    formData.append('city', newCity);
    if (newDescription) formData.append('description', newDescription);
    selectedFeatures.forEach((feat, idx) => {
      formData.append(`features[${idx}]`, feat);
    });
    if (newImage) formData.append('image', newImage);

    try {
      if (editingCarId) {
        formData.append('_method', 'PUT');
        await api.post(`/cars/${editingCarId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        alert('تم تعديل بيانات ومواصفات السيارة بنجاح! ✏️');
      } else {
        await api.post('/cars', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        alert('تم نشر السيارة بالمواصفات الفنية الشاملة في السوق! 🚗✨');
      }
      setShowAddModal(false);
      setEditingCarId(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'حدث خطأ أثناء حفظ السيارة');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditCar = (car: Car) => {
    setEditingCarId(car.id);
    setNewBrand(car.brand);
    setNewModel(car.model);
    setNewVin(car.vin || '');
    setNewYear(car.year);
    setNewPrice(car.price);
    setNewTransType(car.transaction_type);
    setNewCondition(car.condition);
    setNewMileage(car.mileage || 0);
    setNewOwnersCount(car.owners_count || 1);
    setNewAccidentFree(car.is_accident_free ?? true);
    setNewServiceHistory(car.has_service_history ?? true);
    setNewWarrantyMonths(car.warranty_months || 12);
    setNewTuvDate(car.tuv_valid_until || '2027-05-01');
    setNewTransmission(car.transmission || 'automatic');
    setNewFuelType(car.fuel_type || 'petrol');
    setNewEnginePower(car.engine_power || 150);
    setNewBodyType(car.body_type || 'sedan');
    setNewCity(car.city);
    setNewDescription(car.description || '');
    setSelectedFeatures(car.features || []);
    setNewImage(null);
    setShowAddModal(true);
  };

  const handleDeleteCar = async (carId: number) => {
    if (!token) return;
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الإعلان نهائياً؟')) return;

    try {
      await api.delete(`/cars/${carId}`, { headers: { Authorization: `Bearer ${token}` } });
      alert('تم حذف السيارة بنجاح 🗑️');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'فشل حذف السيارة');
    }
  };

  const handleBookCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { alert('يرجى تسجيل الدخول أولاً لتتمكن من إتمام الحجز 🔒'); return; }
    if (!selectedCar) return;

    setBookingLoading(true);
    try {
      const response = await api.post('/rentals', {
        car_id: selectedCar.id,
        start_date: rentalStart,
        end_date: rentalEnd,
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert(response.data.message);
      setSelectedCar(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'تعذر حجز السيارة');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelRental = async (rentalId: number) => {
    if (!token) return;
    if (!window.confirm('هل تريد بالتأكيد إلغاء هذا الحجز؟')) return;
    try {
      await api.post(`/rentals/${rentalId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('تم إلغاء الحجز بنجاح');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'فشل إلغاء الحجز');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { alert('يرجى تسجيل الدخول أولاً لإرسال تقييمك'); return; }
    if (!selectedCar || !selectedCar.user) return;

    setReviewSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        dealer_id: selectedCar.user_id,
        car_id: selectedCar.id,
        rating: reviewRating,
        comment: reviewComment,
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message);
      setReviewComment('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'فشل تسجيل التقييم');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getRoleBadge = (role: string, showroomName?: string, isVerified?: boolean) => {
    switch (role) {
      case 'dealer':
        return (
          <span style={{ backgroundColor: '#0284c7', color: '#fff', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            🏢 {showroomName || 'معرض سيارات'} {isVerified ? '✓ موثق' : '⏳ قيد التدقيق'}
          </span>
        );
      case 'rental_agency':
        return (
          <span style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            🔑 {showroomName || 'مكتب تأجير'} {isVerified ? '✓ موثق' : '⏳ قيد التدقيق'}
          </span>
        );
      case 'admin':
        return <span style={{ backgroundColor: '#dc2626', color: '#fff', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold' }}>🛡️ مدير المنصة</span>;
      default:
        return <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85em' }}>👤 بائع فردي / عميل</span>;
    }
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif', direction: 'rtl', paddingBottom: '90px' }}>
      
      {/* 1. الشريط العلوي الفاخر */}
      <header style={{ backgroundColor: '#0f172a', color: '#fff', padding: '16px 28px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2em' }}>🚗</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4em', fontWeight: 800, letterSpacing: '-0.5px' }}>Mini Car Marketplace</h1>
              <small style={{ color: '#94a3b8', fontSize: '0.8em' }}>بوابتك الألمانية لشراء وبيع وتأجير السيارات الموثقة</small>
            </div>
          </div>

          {/* معلومات المستخدم والدخول */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>مرحباً، <strong>{user.name}</strong></span>
                {getRoleBadge(user.role, user.showroom_name, user.is_verified)}
              </div>
              <button
                onClick={() => { setEditingCarId(null); setShowAddModal(true); }}
                style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ➕ نشر سيارة
              </button>
              <button
                onClick={handleLogout}
                style={{ backgroundColor: '#334155', color: '#e2e8f0', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}
              >
                خروج 🚪
              </button>
            </div>
          ) : registerMode ? (
            <form onSubmit={handleRegister} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="text" placeholder="الاسم" value={regName} onChange={(e) => setRegName(e.target.value)} required style={{ padding: '6px 10px', borderRadius: '6px', border: 'none' }} />
              <input type="email" placeholder="البريد" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '6px 10px', borderRadius: '6px', border: 'none' }} />
              <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '6px 10px', borderRadius: '6px', border: 'none' }} />
              <select value={regRole} onChange={(e) => setRegRole(e.target.value as 'user' | 'dealer' | 'rental_agency')} style={{ padding: '6px', borderRadius: '6px', border: 'none' }}>
                <option value="user">👤 عميل</option>
                <option value="dealer">🏢 معرض سيارات</option>
                <option value="rental_agency">🔑 مكتب تأجير</option>
              </select>
              {regRole !== 'user' && (
                <input type="text" placeholder="اسم المعرض/المكتب" value={regShowroom} onChange={(e) => setRegShowroom(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: 'none' }} />
              )}
              <input type="text" placeholder="رقم الهاتف للتواصل" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: 'none' }} />
              <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>تأكيد التسجيل 📝</button>
              <button type="button" onClick={() => setRegisterMode(false)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>تسجيل دخول</button>
            </form>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required style={{ padding: '6px 10px', borderRadius: '6px', border: 'none' }} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" required style={{ padding: '6px 10px', borderRadius: '6px', border: 'none' }} />
              <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>دخول 🚀</button>
              <button type="button" onClick={() => setRegisterMode(true)} style={{ color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>إنشاء حساب شريك أو عميل</button>
            </form>
          )}

        </div>
      </header>

      {/* 2. شريط التبويبات الفاخر */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderBottom: '2px solid #cbd5e1', paddingBottom: '12px' }}>
          <button
            onClick={() => { setSelectedDealer(null); setActiveTab('market'); }}
            style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, backgroundColor: activeTab === 'market' && !selectedDealer ? '#2563eb' : '#fff', color: activeTab === 'market' && !selectedDealer ? '#fff' : '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
          >
            🚗 السوق العام
          </button>
          
          <button
            onClick={() => { setSelectedDealer(null); setActiveTab('dealers'); }}
            style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, backgroundColor: activeTab === 'dealers' || selectedDealer ? '#2563eb' : '#fff', color: activeTab === 'dealers' || selectedDealer ? '#fff' : '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
          >
            🏢 دليل المعارض والمكاتب ({dealers.length})
          </button>

          {user && (user.role === 'dealer' || user.role === 'rental_agency') && (
            <button
              onClick={() => { setSelectedDealer(null); setActiveTab('partnerHub'); }}
              style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, backgroundColor: activeTab === 'partnerHub' ? '#0d9488' : '#fff', color: activeTab === 'partnerHub' ? '#fff' : '#0f766e', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
            >
              🏛️ بوابة الشركاء والتوثيق الرسمية
            </button>
          )}

          {user && user.role === 'admin' && (
            <button
              onClick={() => { setSelectedDealer(null); setActiveTab('adminHub'); }}
              style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, backgroundColor: activeTab === 'adminHub' ? '#dc2626' : '#fff', color: activeTab === 'adminHub' ? '#fff' : '#b91c1c', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
            >
              🛡️ لوحة اعتماد المعارض ({verifications.filter(v => v.status === 'pending').length})
            </button>
          )}

          {user && (
            <>
              <button
                onClick={() => { setSelectedDealer(null); setActiveTab('myCars'); }}
                style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, backgroundColor: activeTab === 'myCars' ? '#2563eb' : '#fff', color: activeTab === 'myCars' ? '#fff' : '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
              >
                📦 سياراتي المعروضة ({myCars.length})
              </button>
              <button
                onClick={() => { setSelectedDealer(null); setActiveTab('favorites'); }}
                style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, backgroundColor: activeTab === 'favorites' ? '#2563eb' : '#fff', color: activeTab === 'favorites' ? '#fff' : '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
              >
                ❤️ المفضلة ({favoriteCars.length})
              </button>
              <button
                onClick={() => { setSelectedDealer(null); setActiveTab('rentals'); }}
                style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, backgroundColor: activeTab === 'rentals' ? '#2563eb' : '#fff', color: activeTab === 'rentals' ? '#fff' : '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
              >
                📋 حجوزاتي ({myRentals.length})
              </button>
            </>
          )}
        </div>

        {/* 3. شريط الفلاتر الألمانية المتقدمة */}
        {activeTab === 'market' && !selectedDealer && (
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', marginBottom: '25px', marginTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
              <input type="text" placeholder="🔍 بحث بالاسم، الموديل، المدينة..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="">جميع العمليات (بيع/تأجير)</option>
                <option value="sale">بيع 🏷️</option>
                <option value="rent">تأجير 🔑</option>
              </select>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="">جميع الحالات</option>
                <option value="new">جديدة ✨</option>
                <option value="used">مستعملة 🛠️</option>
              </select>
              <select value={transmission} onChange={(e) => setTransmission(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="">نوع القير (الكل)</option>
                <option value="automatic">أوتوماتيك ⚙️</option>
                <option value="manual">عادي / يدوي 🕹️</option>
              </select>
              <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="">نوع الوقود (الكل)</option>
                <option value="petrol">بنزين ⛽</option>
                <option value="diesel">ديزل 🛢️</option>
                <option value="hybrid">هايبرد 🔋</option>
                <option value="electric">كهربائي ⚡</option>
              </select>
              <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="">نوع الهيكل (الكل)</option>
                <option value="sedan">سيدان</option>
                <option value="suv">SUV</option>
                <option value="hatchback">هاتشباك</option>
                <option value="coupe">كوبيه</option>
                <option value="truck">بيك آب</option>
              </select>
              <select value={sellerType} onChange={(e) => setSellerType(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="">نوع البائع (الكل)</option>
                <option value="dealer">🏢 معارض معتمدة فقط</option>
                <option value="private">👤 بائعون أفراد فقط</option>
              </select>
            </div>
          </div>
        )}

        {/* 4. بوابة الشركاء والمعارض المخصصة (Partner & Dealer Hub) */}
        {activeTab === 'partnerHub' && user && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
            <h2 style={{ marginTop: 0, color: '#0f766e' }}>🏛️ بوابة الشركاء والتوثيق التجاري المعتمد</h2>
            
            {/* حالة التوثيق */}
            <div style={{ backgroundColor: user.is_verified ? '#ecfdf5' : '#fffbeb', border: `2px solid ${user.is_verified ? '#10b981' : '#f59e0b'}`, padding: '18px', borderRadius: '10px', marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', color: user.is_verified ? '#047857' : '#b45309' }}>
                    {user.is_verified ? '✓ حساب المعرض موثق رسمياً ومعتمد في المنصة' : '⏳ حالة الحساب: قيد تدقيق ومراجعة الوثائق'}
                  </h3>
                  <p style={{ margin: 0, color: '#475569' }}>
                    {user.is_verified
                      ? 'تهانينا! يظهر معرضك الآن بشارة التوثيق الزرقاء في دليل المعارض المعتمدة.'
                      : 'تم استلام بياناتك وسيتم تدقيق السجل التجاري ورخصة البلدية من قبل الإدارة لمنحك شارة التوثيق.'}
                  </p>
                  {myVerificationStatus?.admin_notes && (
                    <p style={{ margin: '8px 0 0 0', color: '#b91c1c', fontWeight: 'bold' }}>ملاحظة الإدارة: {myVerificationStatus.admin_notes}</p>
                  )}
                </div>
              </div>
            </div>

            {/* نموذج رفع الوثائق */}
            {!user.is_verified && (
              <div>
                <h3>📄 رفع وثائق إثبات واعتماد المعرض:</h3>
                <form onSubmit={handleApplyVerification} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px' }}>
                  <div>
                    <label><strong>1. السجل التجاري الساري (PDF أو صورة):</strong></label>
                    <input type="file" required onChange={(e) => setCommFile(e.target.files ? e.target.files[0] : null)} style={{ width: '100%', marginTop: '6px' }} />
                  </div>
                  <div>
                    <label><strong>2. رخصة مزاولة المهنة / البلدية:</strong></label>
                    <input type="file" required onChange={(e) => setLicFile(e.target.files ? e.target.files[0] : null)} style={{ width: '100%', marginTop: '6px' }} />
                  </div>
                  <div>
                    <label><strong>3. الهوية الوطنية للمالك / المفوض:</strong></label>
                    <input type="file" required onChange={(e) => setIdFile(e.target.files ? e.target.files[0] : null)} style={{ width: '100%', marginTop: '6px' }} />
                  </div>
                  <div>
                    <label><strong>4. صورة واجهة المعرض واللافتة:</strong></label>
                    <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)} style={{ width: '100%', marginTop: '6px' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label><strong>العنوان الجغرافي الدقيق لمقر المعرض:</strong></label>
                    <input type="text" value={showroomAddress} onChange={(e) => setShowroomAddress(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <button type="submit" disabled={verifSubmitting} style={{ backgroundColor: '#0d9488', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {verifSubmitting ? 'جاري رفع وتأكيد الوثائق...' : 'إرسال ملف الوثائق للإدارة للاعتماد 📤'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 5. لوحة تحكم مدير النظام (Admin Hub) */}
        {activeTab === 'adminHub' && user?.role === 'admin' && (
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
            <h2 style={{ marginTop: 0, color: '#b91c1c' }}>🛡️ لوحة الإدارة: طلبات توثيق واعتماد المعارض</h2>
            {verifications.length === 0 ? <p>لا توجد أي طلبات توثيق معلقة حالياً.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '10px' }}>اسم المعرض</th>
                      <th style={{ padding: '10px' }}>المالك</th>
                      <th style={{ padding: '10px' }}>العنوان</th>
                      <th style={{ padding: '10px' }}>الوثائق</th>
                      <th style={{ padding: '10px' }}>الحالة</th>
                      <th style={{ padding: '10px' }}>الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((v) => (
                      <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{v.user?.showroom_name || 'معرض'}</td>
                        <td style={{ padding: '10px' }}>{v.user?.name} ({v.user?.phone})</td>
                        <td style={{ padding: '10px' }}>{v.showroom_address}</td>
                        <td style={{ padding: '10px' }}>
                          <a href={`http://127.0.0.1:8000${v.commercial_record}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', display: 'block' }}>السجل التجاري ↗</a>
                          <a href={`http://127.0.0.1:8000${v.license_document}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', display: 'block' }}>الرخصة ↗</a>
                          <a href={`http://127.0.0.1:8000${v.national_id_document}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', display: 'block' }}>الهوية ↗</a>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ backgroundColor: v.status === 'approved' ? '#dcfce7' : v.status === 'pending' ? '#fef3c7' : '#fee2e2', color: v.status === 'approved' ? '#16a34a' : v.status === 'pending' ? '#b45309' : '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 'bold' }}>
                            {v.status === 'approved' ? 'معتمد ✓' : v.status === 'pending' ? 'قيد المراجعة ⏳' : 'مرفوض ✕'}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>
                          {v.status !== 'approved' && (
                            <button onClick={() => handleAdminDecision(v.id, 'approve')} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '6px' }}>اعتماد ✓</button>
                          )}
                          {v.status !== 'rejected' && (
                            <button onClick={() => handleAdminDecision(v.id, 'reject')} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>رفض ✕</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 6. نموذج إضافة سيارة بالمواصفات الشاملة */}
        {showAddModal && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', border: '2px solid #2563eb', marginBottom: '25px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            <h3 style={{ marginTop: 0, color: '#2563eb', fontSize: '1.3em' }}>{editingCarId ? '✏️ تعديل بيانات ومواصفات السيارة' : '🚗 نشر سيارة جديدة بالمواصفات الفنية الشاملة'}</h3>
            <form onSubmit={handleSaveCar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div><label><strong>الشركة المصنعة:</strong></label><input type="text" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div><label><strong>الموديل والفئة:</strong></label><input type="text" value={newModel} onChange={(e) => setNewModel(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div><label><strong>رقم الهيكل / الشاسيه (VIN):</strong></label><input type="text" placeholder="اختياري" value={newVin} onChange={(e) => setNewVin(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div><label><strong>سنة الصنع:</strong></label><input type="number" value={newYear} onChange={(e) => setNewYear(Number(e.target.value))} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div><label><strong>السعر ($):</strong></label><input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div><label><strong>العداد (كم):</strong></label><input type="number" value={newMileage} onChange={(e) => setNewMileage(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div><label><strong>عدد الملاك السابقين:</strong></label><input type="number" value={newOwnersCount} onChange={(e) => setNewOwnersCount(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div><label><strong>مدة الضمان (أشهر):</strong></label><input type="number" value={newWarrantyMonths} onChange={(e) => setNewWarrantyMonths(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div><label><strong>سريان الفحص الدوري:</strong></label><input type="date" value={newTuvDate} onChange={(e) => setNewTuvDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              <div><label><strong>نوع العملية:</strong></label><select value={newTransType} onChange={(e) => setNewTransType(e.target.value as 'sale' | 'rent')} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}><option value="sale">بيع 🏷️</option><option value="rent">تأجير 🔑</option></select></div>
              <div><label><strong>ناقل الحركة:</strong></label><select value={newTransmission} onChange={(e) => setNewTransmission(e.target.value as 'automatic' | 'manual')} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}><option value="automatic">أوتوماتيك ⚙️</option><option value="manual">يدوي 🕹️</option></select></div>
              <div><label><strong>نوع الوقود:</strong></label><select value={newFuelType} onChange={(e) => setNewFuelType(e.target.value as 'petrol' | 'diesel' | 'hybrid' | 'electric')} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}><option value="petrol">بنزين ⛽</option><option value="diesel">ديزل 🛢️</option><option value="hybrid">هايبرد 🔋</option><option value="electric">كهربائي ⚡</option></select></div>
              <div><label><strong>نوع الهيكل:</strong></label><select value={newBodyType} onChange={(e) => setNewBodyType(e.target.value as 'suv' | 'sedan' | 'hatchback' | 'coupe' | 'truck' | 'van')} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}><option value="sedan">سيدان</option><option value="suv">SUV</option><option value="hatchback">هاتشباك</option><option value="coupe">كوبيه</option><option value="truck">بيك آب</option></select></div>
              <div><label><strong>المدينة:</strong></label><input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              
              {/* خيارات الفحص والصيانة */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '25px', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <label style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={newAccidentFree} onChange={(e) => setNewAccidentFree(e.target.checked)} style={{ marginLeft: '6px' }} />
                  <strong>خالية من الحوادث تماماً (Unfallfrei ✓)</strong>
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={newServiceHistory} onChange={(e) => setNewServiceHistory(e.target.checked)} style={{ marginLeft: '6px' }} />
                  <strong>سجل الصيانة بالوكالة متوفر (Service History ✓)</strong>
                </label>
              </div>

              {/* قائمة الكماليات */}
              <div style={{ gridColumn: '1 / -1', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}><strong>قائمة التجهيزات والكماليات:</strong></label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {availableFeatures.map((feat) => (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: selectedFeatures.includes(feat) ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: selectedFeatures.includes(feat) ? '#eff6ff' : '#fff',
                        color: selectedFeatures.includes(feat) ? '#1d4ed8' : '#475569',
                        cursor: 'pointer',
                        fontWeight: selectedFeatures.includes(feat) ? 'bold' : 'normal',
                      }}
                    >
                      {selectedFeatures.includes(feat) ? '✓ ' : '+ '}{feat}
                    </button>
                  ))}
                </div>
              </div>

              <div><label><strong>صورة السيارة الرئيسية 📸:</strong></label><input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)} style={{ width: '100%', marginTop: '6px' }} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label><strong>الوصف والملاحظات:</strong></label><textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={2} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
              
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" disabled={submitting} style={{ backgroundColor: '#10b981', color: '#fff', padding: '12px 28px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em' }}>{submitting ? 'جاري الحفظ...' : 'حفظ ونشر السيارة 🚀'}</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ backgroundColor: '#64748b', color: '#fff', padding: '12px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        )}

        {/* مؤشر التحميل والأخطاء */}
        {loading && <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.2em', color: '#64748b' }}>جاري تحديث السيارات... 🚗</div>}
        {error && <div style={{ color: '#ef4444', textAlign: 'center', padding: '15px' }}>{error}</div>}

        {/* 7. صفحة المعرض المستقلة (Storefront Page) */}
        {selectedDealer ? (
          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.8em' }}>🏢 {selectedDealer.showroom_name}</h2>
                  {selectedDealer.is_verified && <span style={{ backgroundColor: '#0284c7', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold' }}>معرض موثق رسمياً ✓</span>}
                </div>
                <p style={{ margin: '8px 0 0 0', color: '#64748b' }}>📍 المدينة: {selectedDealer.city} | 🚗 أسطول المعرض: {selectedDealer.cars?.length || 0} سيارة</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', backgroundColor: '#fef3c7', padding: '8px 18px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#b45309' }}>⭐ {selectedDealer.average_rating} / 5</div>
                  <small style={{ color: '#92400e' }}>({selectedDealer.total_reviews} مراجعة)</small>
                </div>
                {selectedDealer.phone && (
                  <a href={`https://wa.me/${selectedDealer.phone}`} target="_blank" rel="noreferrer" style={{ backgroundColor: '#25D366', color: '#fff', padding: '12px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' }}>واتساب المعرض 💬</a>
                )}
                <button onClick={() => setSelectedDealer(null)} style={{ backgroundColor: '#64748b', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer' }}>الرجوع للمعايير ↩️</button>
              </div>
            </div>

            <h3>🚗 أسطول سيارات هذا المعرض ({selectedDealer.cars?.length || 0})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '35px' }}>
              {selectedDealer.cars?.map((car) => (
                <div key={car.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', backgroundColor: '#f8fafc' }}>
                  {car.image_url ? <img src={`http://127.0.0.1:8000${car.image_url}`} alt={car.model} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} /> : <div style={{ height: '130px', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2em' }}>🚗</div>}
                  <h4 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>{car.brand} - {car.model} ({car.year})</h4>
                  <p style={{ margin: '4px 0', fontWeight: 'bold', color: '#16a34a', fontSize: '1.2em' }}>${car.price}</p>
                  <button onClick={() => setSelectedCar(car)} style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px' }}>عرض التفاصيل والمواصفات 🔍</button>
                </div>
              ))}
            </div>

            <h3>⭐ تقييمات المشترين حول هذا المعرض ({selectedDealer.reviews?.length || 0})</h3>
            {selectedDealer.reviews?.length === 0 ? <p style={{ color: '#64748b' }}>لا توجد تقييمات مضافة لهذا المعرض بعد.</p> : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {selectedDealer.reviews?.map((rev) => (
                  <div key={rev.id} style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{rev.user?.name || 'مشتري معتمد'}</strong>
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{'⭐'.repeat(rev.rating)} ({rev.rating}/5)</span>
                    </div>
                    {rev.comment && <p style={{ margin: '8px 0 0 0', color: '#334155' }}>{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'dealers' ? (
          /* 8. دليل المعارض المعتمدة */
          <div>
            <h2 style={{ color: '#0f172a' }}>🏢 دليل معارض ومكاتب تأجير السيارات المعتمدة</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
              {dealers.map((d) => (
                <div key={d.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2em' }}>{d.showroom_name}</h3>
                      {d.is_verified && <span style={{ backgroundColor: '#0284c7', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75em', fontWeight: 'bold' }}>موثق ✓</span>}
                    </div>
                    <p style={{ margin: '4px 0', color: '#64748b' }}>{d.role === 'dealer' ? '🏢 معرض لبيع السيارات' : '🔑 مكتب تأجير سيارات'}</p>
                    <p style={{ margin: '4px 0', color: '#334155' }}>📍 المدينة: {d.city}</p>
                    <p style={{ margin: '4px 0', color: '#16a34a', fontWeight: 'bold' }}>🚗 السيارات المتوفرة بالمعرض: {d.cars_count}</p>
                    <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginTop: '8px', fontSize: '0.9em', fontWeight: 'bold' }}>
                      ⭐ {d.average_rating} / 5 ({d.total_reviews} تقييم)
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                    <button onClick={() => openDealerStorefront(d.id)} style={{ flex: 1, backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      زيارة المعرض وتصفح أسطوله 🏢
                    </button>
                    {d.phone && (
                      <a href={`https://wa.me/${d.phone}`} target="_blank" rel="noreferrer" style={{ backgroundColor: '#25D366', color: '#fff', padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>💬</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'rentals' ? (
          <div>
            <h2>📋 قائمة حجوزاتي</h2>
            {myRentals.length === 0 ? <p>لا توجد لديك أي حجوزات حالية.</p> : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {myRentals.map((r) => (
                  <div key={r.id} style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1em' }}>{r.car?.brand} {r.car?.model} ({r.car?.year})</h4>
                      <p style={{ margin: '4px 0' }}><strong>الفترة:</strong> من {r.start_date} إلى {r.end_date}</p>
                      <p style={{ margin: '4px 0' }}><strong>الإجمالي:</strong> ${r.total_price} | <strong>الحالة:</strong> <span style={{ color: r.status === 'confirmed' ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>{r.status === 'confirmed' ? 'مؤكد ✓' : 'ملغي ✗'}</span></p>
                    </div>
                    {r.status === 'confirmed' && (
                      <button onClick={() => handleCancelRental(r.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>إلغاء الحجز ✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 9. عرض شبكة بطاقات السيارات الألمانية الفاخرة */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '22px' }}>
            {(activeTab === 'myCars' ? myCars : activeTab === 'favorites' ? favoriteCars : cars).map((car) => {
              const isFav = favoriteIds.includes(car.id);
              const isOwner = user && user.id === car.user_id;
              const isCompared = compareCars.some((c) => c.id === car.id);

              return (
                <div key={car.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', backgroundColor: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* زر المفضلة */}
                    <button
                      onClick={() => handleToggleFavorite(car.id)}
                      style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', zIndex: 2, fontSize: '1.2em' }}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>

                    {/* صورة السيارة */}
                    {car.image_url ? (
                      <img src={`http://127.0.0.1:8000${car.image_url}`} alt={car.model} style={{ width: '100%', height: '185px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
                    ) : (
                      <div style={{ width: '100%', height: '150px', backgroundColor: '#e2e8f0', borderRadius: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8em' }}>🚗</div>
                    )}

                    {/* تفاصيل البائع وشارة المعرض */}
                    <div style={{ marginBottom: '8px' }}>
                      {car.user && getRoleBadge(car.user.role, car.user.showroom_name, car.user.is_verified)}
                    </div>

                    <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.2em' }}>{car.brand} - {car.model}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '1.35em', fontWeight: 800, color: '#16a34a' }}>
                        ${car.price} {car.transaction_type === 'rent' && <small style={{ fontSize: '0.6em', color: '#64748b' }}>/ يوم</small>}
                      </span>
                      {car.price_rating && (
                        <span
                          style={{
                            backgroundColor: car.price_rating.bg,
                            color: car.price_rating.color,
                            padding: '4px 10px',
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

                    {/* شريط المواصفات الألمانية */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.85em', marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <span>⚙️ {car.transmission === 'automatic' ? 'أوتوماتيك' : 'يدوي'}</span>
                      <span>⛽ {car.fuel_type || 'بنزين'}</span>
                      <span>🛣️ {car.mileage ? `${car.mileage.toLocaleString()} كم` : '0 كم'}</span>
                      <span>📍 {car.city}</span>
                    </div>

                    {/* شارات الفحص وخلو الحوادث */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {car.is_accident_free && <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>✓ خالية من الحوادث</span>}
                      {car.has_service_history && <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>✓ سجل الصيانة</span>}
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setSelectedCar(car)}
                      style={{ flex: 1, backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      عرض التفاصيل الكاملة 🔍
                    </button>

                    <button
                      onClick={() => toggleCompare(car)}
                      style={{
                        backgroundColor: isCompared ? '#dcfce7' : '#f8fafc',
                        color: isCompared ? '#16a34a' : '#475569',
                        border: isCompared ? '1px solid #16a34a' : '1px solid #cbd5e1',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: isCompared ? 'bold' : 'normal',
                      }}
                    >
                      {isCompared ? '✓ مقارنة' : '⚖️ مقارنة'}
                    </button>

                    {isOwner && (
                      <>
                        <button onClick={() => startEditCar(car)} style={{ backgroundColor: '#f59e0b', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }} title="تعديل">✏️</button>
                        <button onClick={() => handleDeleteCar(car.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }} title="حذف">🗑️</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 10. شريط المقارنة العائم */}
        {compareCars.length > 0 && (
          <div
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#0f172a',
              color: '#fff',
              padding: '12px 26px',
              borderRadius: '50px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              zIndex: 900,
            }}
          >
            <span>⚖️ تم تحديد <strong>{compareCars.length}</strong> سيارات للمقارنة</span>
            <button
              onClick={() => setShowCompareModal(true)}
              style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              فتح جدول المقارنة 📊
            </button>
            <button onClick={() => setCompareCars([])} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}>✕</button>
          </div>
        )}

        {/* 11. نافذة جدول مقارنة السيارات المخصص */}
        {showCompareModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '15px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '950px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '26px', position: 'relative' }}>
              <button onClick={() => setShowCompareModal(false)} style={{ position: 'absolute', top: '15px', left: '15px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', fontSize: '1.1em' }}>✕</button>

              <h2 style={{ color: '#0f172a', marginTop: 0, textAlign: 'center' }}>⚖️ جدول مقارنة مواصفات السيارات</h2>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '12px', width: '22%' }}>المواصفة</th>
                      {compareCars.map((car) => (
                        <th key={car.id} style={{ padding: '12px', textAlign: 'center' }}>
                          {car.image_url && <img src={`http://127.0.0.1:8000${car.image_url}`} alt={car.model} style={{ width: '110px', height: '70px', objectFit: 'cover', borderRadius: '8px', display: 'block', margin: '0 auto 6px auto' }} />}
                          <div style={{ fontWeight: 'bold', color: '#2563eb' }}>{car.brand} - {car.model}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>السعر</td>
                      {compareCars.map((car) => (
                        <td key={car.id} style={{ padding: '10px', textAlign: 'center', fontWeight: 800, color: '#16a34a', fontSize: '1.15em' }}>${car.price}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>تقييم السعر</td>
                      {compareCars.map((car) => (
                        <td key={car.id} style={{ padding: '10px', textAlign: 'center' }}>
                          {car.price_rating ? <span style={{ color: car.price_rating.color, fontWeight: 'bold' }}>{car.price_rating.icon} {car.price_rating.label}</span> : 'سعر عادل'}
                        </td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>سنة الصنع</td>
                      {compareCars.map((car) => (
                        <td key={car.id} style={{ padding: '10px', textAlign: 'center' }}>{car.year}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>العداد بالكيلومترات</td>
                      {compareCars.map((car) => (
                        <td key={car.id} style={{ padding: '10px', textAlign: 'center' }}>{car.mileage ? `${car.mileage.toLocaleString()} كم` : '0 كم'}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>ناقل الحركة (القير)</td>
                      {compareCars.map((car) => (
                        <td key={car.id} style={{ padding: '10px', textAlign: 'center' }}>{car.transmission === 'automatic' ? 'أوتوماتيك ⚙️' : 'عادي 🕹️'}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>نوع الوقود</td>
                      {compareCars.map((car) => (
                        <td key={car.id} style={{ padding: '10px', textAlign: 'center' }}>{car.fuel_type || 'بنزين'}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>قوة المحرك</td>
                      {compareCars.map((car) => (
                        <td key={car.id} style={{ padding: '10px', textAlign: 'center' }}>{car.engine_power ? `${car.engine_power} HP` : 'غير محدد'}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>نوع الهيكل</td>
                      {compareCars.map((car) => (
                        <td key={car.id} style={{ padding: '10px', textAlign: 'center' }}>{car.body_type || 'سيدان'}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>خلو الحوادث</td>
                      {compareCars.map((car) => (
                        <td key={car.id} style={{ padding: '10px', textAlign: 'center', color: car.is_accident_free ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                          {car.is_accident_free ? 'خالية من الحوادث ✓' : 'توجد حوادث سابقة'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>البائع / المعرض</td>
                      {compareCars.map((car) => (
                        <td key={car.id} style={{ padding: '10px', textAlign: 'center' }}>
                          {car.user?.showroom_name || car.user?.name}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 12. نافذة تفاصيل السيارة المنبثقة الكاملة */}
        {selectedCar && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '850px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
              <button onClick={() => setSelectedCar(null)} style={{ position: 'absolute', top: '15px', left: '15px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', fontSize: '1.1em' }}>✕</button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <h2 style={{ color: '#0f172a', margin: '0 0 6px 0', fontSize: '1.6em' }}>{selectedCar.brand} - {selectedCar.model} ({selectedCar.year})</h2>
                  {selectedCar.vin && <small style={{ color: '#64748b', fontSize: '0.85em' }}>رقم الشاسيه / VIN: <code>{selectedCar.vin}</code></small>}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '1.6em', fontWeight: 800, color: '#16a34a' }}>${selectedCar.price} {selectedCar.transaction_type === 'rent' && <small style={{ fontSize: '0.6em', color: '#64748b' }}>/ يوم</small>}</div>
                  {selectedCar.price_rating && <span style={{ backgroundColor: selectedCar.price_rating.bg, color: selectedCar.price_rating.color, padding: '3px 10px', borderRadius: '12px', fontSize: '0.8em', fontWeight: 'bold' }}>{selectedCar.price_rating.icon} {selectedCar.price_rating.label}</span>}
                </div>
              </div>

              {selectedCar.image_url && (
                <img src={`http://127.0.0.1:8000${selectedCar.image_url}`} alt={selectedCar.model} style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '12px', marginBottom: '18px' }} />
              )}

              {/* شبكة المواصفات الفنية التفصيلية */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', marginBottom: '18px' }}>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.85em' }}>عداد الكيلومترات:</span><strong>{selectedCar.mileage ? `${selectedCar.mileage.toLocaleString()} كم` : '0 كم'}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.85em' }}>ناقل الحركة:</span><strong>{selectedCar.transmission === 'automatic' ? 'أوتوماتيك ⚙️' : 'عادي 🕹️'}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.85em' }}>نوع الوقود:</span><strong>{selectedCar.fuel_type || 'بنزين'}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.85em' }}>قوة المحرك:</span><strong>{selectedCar.engine_power ? `${selectedCar.engine_power} HP` : 'غير محدد'}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.85em' }}>نوع الهيكل:</span><strong>{selectedCar.body_type || 'سيدان'}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.85em' }}>عدد الملاك السابقين:</span><strong>{selectedCar.owners_count || 1}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.85em' }}>سريان الفحص الدوري:</span><strong>{selectedCar.tuv_valid_until || 'ساري ✓'}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.85em' }}>الضمان:</span><strong>{selectedCar.warranty_months ? `ضمان ${selectedCar.warranty_months} شهراً` : 'بدون ضمان'}</strong></div>
              </div>

              {/* بطاقات الفحص المعتمد */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {selectedCar.is_accident_free && <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold' }}>✓ خالية من الحوادث (Unfallfrei)</span>}
                {selectedCar.has_service_history && <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold' }}>✓ سجل الصيانة بالوكالة متوفر</span>}
              </div>

              {/* التجهيزات والكماليات */}
              {selectedCar.features && selectedCar.features.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>الكماليات والتجهيزات المرفقة:</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedCar.features.map((f) => (
                      <span key={f} style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold' }}>✓ {f}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCar.description && (
                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>ملاحظات ووصف البائع:</h4>
                  <p style={{ color: '#475569', lineHeight: '1.6', margin: 0 }}>{selectedCar.description}</p>
                </div>
              )}

              {/* بطاقة البائع والمعرض */}
              {selectedCar.user && (
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', marginBottom: '18px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>معلومات البائع / المعرض:</h4>
                  <p style={{ margin: '4px 0' }}><strong>الاسم:</strong> {selectedCar.user.showroom_name || selectedCar.user.name} {selectedCar.user.is_verified && <span style={{ color: '#0284c7', fontWeight: 'bold' }}>✓ موثق</span>}</p>
                  {selectedCar.user.phone && <p style={{ margin: '4px 0' }}><strong>رقم الهاتف:</strong> {selectedCar.user.phone}</p>}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    {selectedCar.user.phone && (
                      <a href={`https://wa.me/${selectedCar.user.phone}`} target="_blank" rel="noreferrer" style={{ backgroundColor: '#25D366', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>واتساب 💬</a>
                    )}
                    {selectedCar.user.phone && (
                      <a href={`tel:${selectedCar.user.phone}`} style={{ backgroundColor: '#2563eb', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>اتصال 📞</a>
                    )}
                  </div>
                </div>
              )}

              {/* تقييم المعرض */}
              {user && user.id !== selectedCar.user_id && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '12px', marginBottom: '18px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#92400e' }}>⭐ تقييم هذا البائع / المعرض:</h4>
                  <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label>التقييم بالنجوم:</label>
                      <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} style={{ padding: '6px 10px', borderRadius: '6px' }}>
                        <option value={5}>⭐⭐⭐⭐⭐ (5 من 5 ممتاز)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 من 5 جيد جداً)</option>
                        <option value={3}>⭐⭐⭐ (3 من 5 جيد)</option>
                        <option value={2}>⭐⭐ (2 من 5 مقبول)</option>
                        <option value={1}>⭐ (1 من 5 ضعيف)</option>
                      </select>
                    </div>
                    <input type="text" placeholder="اكتب تعليقك وتجربتك مع المعرض..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <button type="submit" disabled={reviewSubmitting} style={{ alignSelf: 'flex-start', backgroundColor: '#f59e0b', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {reviewSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم ⭐'}
                    </button>
                  </form>
                </div>
              )}

              {/* نموذج الحجز الفوري لسيارات التأجير */}
              {selectedCar.transaction_type === 'rent' && (
                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '18px' }}>
                  <h4 style={{ color: '#6b21a8', margin: '0 0 10px 0' }}>🔑 حجز هذه السيارة للتأجير:</h4>
                  <form onSubmit={handleBookCar} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <label style={{ fontSize: '0.85em', display: 'block', marginBottom: '4px' }}>من تاريخ:</label>
                      <input type="date" value={rentalStart} onChange={(e) => setRentalStart(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85em', display: 'block', marginBottom: '4px' }}>إلى تاريخ:</label>
                      <input type="date" value={rentalEnd} onChange={(e) => setRentalEnd(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <button type="submit" disabled={bookingLoading} style={{ backgroundColor: '#7c3aed', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-end' }}>
                      {bookingLoading ? 'جاري التأكيد...' : 'تأكيد الحجز الفوري 🚀'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};