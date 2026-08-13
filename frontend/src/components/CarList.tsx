import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import type { Car, User } from '../types/car';

export const CarList = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // بيانات المستخدم وتوثيقه
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

  // 1. جلب قائمة السيارات العامة
  useEffect(() => {
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

    const timer = setTimeout(() => {
      fetchCars();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, transactionType, condition]);

  // 2. جلب المفضلة عندما يكون المستخدم مسجل دخوله
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
        console.error('تعذر جلب المفضلة:', err);
      }
    };

    fetchFavorites();
  }, [token]);

  // دالة تسجيل الدخول من الواجهة مباشرة
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

  // دالة تسجيل الخروج
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

  // دالة تبديل المفضلة
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

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* شريط إدارة الحساب وتسجيل الدخول */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%', justifyContent: 'space-between' }}>
            <span>مرحباً بك، <strong>{user.name}</strong> 👋 ({user.email})</span>
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
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
            <span>🔒 تسجيل دخول سريع:</span>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
            <input
              type="password"
              placeholder="كلمة المرور"
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
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5em',
                    cursor: 'pointer',
                  }}
                >
                  {isFav ? '❤️' : '🤍'}
                </button>

                <h3 style={{ margin: '0 0 10px 0', color: '#1a73e8', paddingLeft: '35px' }}>
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