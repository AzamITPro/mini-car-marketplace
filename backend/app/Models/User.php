<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'showroom_name',
        'city',
        'is_verified',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_verified'       => 'boolean',
        ];
    }

    public function cars()
    {
        return $this->hasMany(Car::class);
    }

    public function favoriteCars()
    {
        return $this->belongsToMany(Car::class, 'favorites')->withTimestamps();
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }
    /**
     * Reviews received by this dealer/seller.
     */
    public function receivedReviews()
    {
        return $this->hasMany(Review::class, 'dealer_id');
    }
}
