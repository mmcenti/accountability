<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Home', [
            'title' => 'ChainForge - Goal Tracking with Accountability'
        ]);
    });
    
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Goals routes
    Route::prefix('goals')->name('goals.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Goals/Index');
        })->name('index');
        
        Route::get('/create', function () {
            return Inertia::render('Goals/Create');
        })->name('create');
    });
    
    // Groups routes
    Route::prefix('groups')->name('groups.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Groups/Index');
        })->name('index');
        
        Route::get('/create', function () {
            return Inertia::render('Groups/Create');
        })->name('create');
    });
});
