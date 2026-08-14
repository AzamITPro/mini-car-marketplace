<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'brand',
        'model',
        'year',
        'price',
        'transaction_type',
        'description',
        'city',
        'condition',
        'mileage',
        'transmission',
        'fuel_type',
        'engine_power',
        'body_type',
        'status',
        'image_url',
        'is_available',
    ];

    // إرفاق تقييم السعر تلقائياً مع كائن الـ JSON القادم للـ API
    protected $appends = ['price_rating'];

    /**
     * خوارزمية تقييم السعر العادل ومقارنته بالسوق
     */
    public function getPriceRatingAttribute()
    {
        $avgPrice = self::where('brand', $this->brand)
            ->where('model', $this->model)
            ->where('year', $this->year)
            ->avg('price');

        if (!$avgPrice || $avgPrice == 0) {
            return [
                'badge' => 'fair',
                'label' => 'سعر عادل',
                'color' => '#d97706',
                'bg'    => '#fef3c7',
                'icon'  => '🟡',
            ];
        }

        $diff = (($this->price - $avgPrice) / $avgPrice) * 100;

        if ($diff <= -8) {
            return [
                'badge' => 'great',
                'label' => 'سعر ممتاز جداً',
                'color' => '#059669',
                'bg'    => '#d1fae5',
                'icon'  => '🟢',
            ];
        } elseif ($diff <= 8) {
            return [
                'badge' => 'fair',
                'label' => 'سعر عادل',
                'color' => '#d97706',
                'bg'    => '#fef3c7',
                'icon'  => '🟡',
            ];
        } else {
            return [
                'badge' => 'high',
                'label' => 'سعر مرتفع',
                'color' => '#dc2626',
                'bg'    => '#fee2e2',
                'icon'  => '🔴',
            ];
        }
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
