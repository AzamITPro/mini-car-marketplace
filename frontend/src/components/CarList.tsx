import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Car } from '../types/car';

export const CarList = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // جلب قائمة السيارات حياً من Laravel API
    const fetchCars = async () => {
      try {
        const response = await api.get('/cars');
        setCars(response.data.data);
      } catch (err) {
        console.error(err);
        setError('تعذر الاتصال بالخادم لجلب قائمة السيارات');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em' }}>جاري تحميل السيارات... 🚗</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red', textAlign: 'center', fontSize: '1.1em' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🚗 قائمة السيارات المتاحة</h2>
      
      {cars.length === 0 ? (
        <p style={{ textAlign: 'center' }}>لا توجد سيارات متاحة حالياً.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {cars.map((car) => (
            <div 
              key={car.id} 
              style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                backgroundColor: '#ffffff',
                color: '#333'
              }}
            >
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
          ))}
        </div>
      )}
    </div>
  );
};