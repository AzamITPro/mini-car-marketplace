<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'car_id',
        'start_date',
        'end_date',
        'total_price',
        'status',
    ];

    /**
     * Get the tenant user who booked the rental.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the rented car.
     */
    public function car()
    {
        return $this->belongsTo(Car::class);
    }
}
