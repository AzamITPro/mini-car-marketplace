import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import type { Car, User } from '../types/car';

export const CarList = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // حالة المستخدم
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('user_info') ? JSON.parse(localStorage.getItem('user_info')!) : null
  );
  const [email, setEmail] = useState<string>('mohammed@example.com');
  const [password, setPassword] = useState<string>('password123');

  // شريط البحث والتصفية
  const [search, setSearch] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>('');
  const [condition, setCondition] = useState<string>('');

  // حالة نموذج إضافة سيارة
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newBrand, setNewBrand] = useState<string>('');
  const [newModel, setNewModel] = useState<string>('');
  const [newYear, setNewYear] = useState<number>(2023);
  const [newPrice, setNewPrice] = useState<number>(18000);
  const [newTransType, setNewTransType] = useState<'sale' | 'rent'>('sale');
  const [newCondition, setNewCondition] = useState<'new' | 'used'>('new');
  const [newCity, setNewCity] = useState<string>('صنعاء');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // دالة جلب قائمة السيارات
  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cars', {
        params: {
          search: search || undefined,
          transaction_type: transactionType || undefined,
          condition: condition || undefined,
        },
      });
      setCars(response.data.data);
    } catch (err) {
      console.error(err);
      setError('تعذر الاتصال بالخادم لجلب قائمة السيارات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCars();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, transactionType, condition]);

  // جلب المفضلة
  useEffect(() => {
    if (!token) {
      setFavoriteIds([]);
      return;
    }
    const fetchFavorites = async () => {
      try {
        const response = await api.get('/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favCars: Car[] = response.data.data;
        setFavoriteIds(favCars.map((c) => c.id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFavorites();
  }, [token]);

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
      alert('تم تسجيل الدخول بنجاح! 🎉');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'فشل تسجيل الدخول');
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
      setFavoriteIds([]);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
    }
  };

  // تبديل المفضلة
  const handleToggleFavorite = async (carId: number) => {
    if (!token) {
      alert('يرجى تسجيل الدخول أولاً لتتمكن من إضافة السيارة للمفضلة 🔒');
      return;
    }
    try {
      const response = await api.post(
        `/favorites/toggle/${carId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      const isFavorited: boolean = response.data.is_favorited;
      if (isFavorited) {
        setFavoriteIds((prev) => [...prev, carId]);
      } else {
        setFavoriteIds((prev) => prev.filter((id) => id !== carId));
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(`تنبيه: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // إرسال نموذج إضافة سيارة جديدة مع الصورة
  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('يجب تسجيل الدخول لإضافة سيارة');
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
    formData.append('city', newCity);
    if (newDescription) formData.append('description', newDescription);
    if (newImage) formData.append('image', newImage);

    try {
      await api.post('/cars', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('تم نشر السيارة بنجاح مع الصورة! 🚗✨');
      setShowAddModal(false);
      // إعادة تعيين الحقول
      setNewBrand('');
      setNewModel('');
      setNewDescription('');
      setNewImage(null);
      // تحديث قائمة السيارات
      fetchCars();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'حدث خطأ أثناء إضافة السيارة');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* شريط إدارة الحساب */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '14px 20px',
          borderRadius: '10px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <span>مرحباً بك، <strong>{user.name}</strong> 👋</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                إضافة سيارة جديدة ➕
              </button>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                تسجيل الخروج 🚪
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
            <span>🔒 تسجيل دخول:</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              دخول 🚀
            </button>
          </form>
        )}
      </div>

      {/* نافذة / نموذج إضافة سيارة جديدة */}
      {showAddModal && (
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            marginBottom: '25px',
            border: '2px solid #007bff',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#007bff' }}>🚗 إضافة سيارة جديدة للبيع أو التأجير</h3>
          <form onSubmit={handleAddCar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label>الشركة المصنعة:</label>
              <input
                type="text"
                placeholder="مثل: Kia, Honda, BMW"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div>
              <label>الموديل:</label>
              <input
                type="text"
                placeholder="مثل: Sportage, Civic"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div>
              <label>سنة الصنع:</label>
              <input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div>
              <label>السعر ($):</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div>
              <label>نوع المعاملة:</label>
              <select
                value={newTransType}
                onChange={(e) => setNewTransType(e.target.value as 'sale' | 'rent')}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              >
                <option value="sale">بيع 🏷️</option>
                <option value="rent">تأجير 🔑</option>
              </select>
            </div>
            <div>
              <label>الحالة:</label>
              <select
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value as 'new' | 'used')}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              >
                <option value="new">جديدة ✨</option>
                <option value="used">مستعملة 🛠️</option>
              </select>
            </div>
            <div>
              <label>المدينة:</label>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div>
              <label>صورة السيارة 📸:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)}
                style={{ width: '100%', padding: '5px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>وصف السيارة:</label>
              <textarea
                placeholder="أدخل مواصفات وملاحظات السيارة..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                rows={2}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: '#28a745',
                  color: '#fff',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {submitting ? 'جاري رفع ونشر السيارة...' : 'نشر السيارة 🚀'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* شريط البحث والتصفية */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '10px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
          marginBottom: '25px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="ابحث عن شركة، موديل، مدينة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 220px',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '0.95em',
          }}
        />

        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '0.95em',
            backgroundColor: '#fff',
          }}
        >
          <option value="">جميع الأنواع (بيع وتأجير)</option>
          <option value="sale">بيع 🏷️</option>
          <option value="rent">تأجير 🔑</option>
        </select>

        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '0.95em',
            backgroundColor: '#fff',
          }}
        >
          <option value="">جميع الحالات</option>
          <option value="new">جديدة ✨</option>
          <option value="used">مستعملة 🛠️</option>
        </select>
      </div>

      {/* بطاقات عرض السيارات */}
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em' }}>جاري تحديث السيارات... 🚗</div>
      ) : error ? (
        <div style={{ padding: '20px', color: 'red', textAlign: 'center', fontSize: '1.1em' }}>{error}</div>
      ) : cars.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.1em', color: '#666', marginTop: '30px' }}>
          لا توجد سيارات تطابق معايير البحث الحالية. 🔍
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {cars.map((car) => {
            const isFav = favoriteIds.includes(car.id);

            return (
              <div
                key={car.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '10px',
                  padding: '16px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  backgroundColor: '#ffffff',
                  color: '#333',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* زر القلب للمفضلة */}
                <button
                  onClick={() => handleToggleFavorite(car.id)}
                  title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(255,255,255,0.85)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    fontSize: '1.3em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 2,
                  }}
                >
                  {isFav ? '❤️' : '🤍'}
                </button>

                {/* عرض صورة السيارة المرفوعة إن وجدت */}
                {car.image_url ? (
                  <img
                    src={`http://127.0.0.1:8000${car.image_url}`}
                    alt={`${car.brand} ${car.model}`}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '12px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '140px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3em',
                    }}
                  >
                    🚗
                  </div>
                )}

                <h3 style={{ margin: '0 0 10px 0', color: '#1a73e8' }}>
                  {car.brand} - {car.model}
                </h3>
                <p style={{ margin: '5px 0' }}><strong>السعر:</strong> ${car.price}</p>
                <p style={{ margin: '5px 0' }}><strong>سنة الصنع:</strong> {car.year}</p>
                <p style={{ margin: '5px 0' }}><strong>المدينة:</strong> {car.city}</p>
                <p style={{ margin: '5px 0' }}><strong>النوع:</strong> {car.transaction_type === 'sale' ? 'بيع 🏷️' : 'تأجير 🔑'}</p>
                <p style={{ margin: '5px 0' }}><strong>الحالة:</strong> {car.condition === 'new' ? 'جديدة ✨' : 'مستعملة 🛠️'}</p>
                {car.user && <p style={{ fontSize: '0.9em', color: '#666', margin: '5px 0' }}><strong>المالك:</strong> {car.user.name}</p>}
                {car.description && <p style={{ fontSize: '0.9em', color: '#555', fontStyle: 'italic', margin: '5px 0' }}>{car.description}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};