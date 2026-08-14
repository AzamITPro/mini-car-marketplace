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
}
