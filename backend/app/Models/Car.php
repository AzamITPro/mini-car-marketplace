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
        'vin',
        'year',
        'price',
        'transaction_type',
        'description',
        'city',
        'condition',
        'mileage',
        'owners_count',
        'is_accident_free',
        'has_service_history',
        'warranty_months',
        'tuv_valid_until',
        'transmission',
        'fuel_type',
        'engine_power',
        'body_type',
        'features',
        'status',
        'image_url',
        'is_available',
    ];

    protected $casts = [
        'features'            => 'array',
        'is_accident_free'    => 'boolean',
        'has_service_history' => 'boolean',
        'is_available'        => 'boolean',
    ];

    protected $appends = ['price_rating'];

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
