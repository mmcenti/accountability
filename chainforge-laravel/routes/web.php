<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\SubscriptionController;

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
        Route::get('/', [GoalController::class, 'index'])->name('index');
        Route::get('/create', [GoalController::class, 'create'])->name('create');
        Route::post('/', [GoalController::class, 'store'])->name('store');
        Route::get('/discover', [GoalController::class, 'discover'])->name('discover');
        Route::get('/{goal}', [GoalController::class, 'show'])->name('show');
        Route::get('/{goal}/edit', [GoalController::class, 'edit'])->name('edit');
        Route::put('/{goal}', [GoalController::class, 'update'])->name('update');
        Route::delete('/{goal}', [GoalController::class, 'destroy'])->name('destroy');
        Route::post('/{goal}/progress', [GoalController::class, 'addProgress'])->name('progress.store');
    });
    
    // Groups routes
    Route::prefix('groups')->name('groups.')->group(function () {
        Route::get('/', [GroupController::class, 'index'])->name('index');
        Route::get('/create', [GroupController::class, 'create'])->name('create');
        Route::post('/', [GroupController::class, 'store'])->name('store');
        Route::post('/join', [GroupController::class, 'join'])->name('join');
        Route::get('/{group}', [GroupController::class, 'show'])->name('show');
        Route::post('/{group}/leave', [GroupController::class, 'leave'])->name('leave');
        Route::post('/{group}/goals', [GroupController::class, 'createGoal'])->name('goals.store');
        Route::post('/periods/{period}/target', [GroupController::class, 'setTarget'])->name('periods.target');
        Route::post('/periods/{period}/progress', [GroupController::class, 'addProgress'])->name('periods.progress');
    });
    
    // Subscription routes
    Route::prefix('subscription')->name('subscription.')->group(function () {
        Route::get('/', [SubscriptionController::class, 'index'])->name('index');
        Route::post('/free-trial', [SubscriptionController::class, 'startFreeTrial'])->name('free-trial');
        Route::post('/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscribe');
        Route::post('/cancel', [SubscriptionController::class, 'cancel'])->name('cancel');
        Route::post('/resume', [SubscriptionController::class, 'resume'])->name('resume');
        Route::post('/payment-method', [SubscriptionController::class, 'updatePaymentMethod'])->name('payment-method');
        Route::get('/billing-portal', [SubscriptionController::class, 'billingPortal'])->name('billing-portal');
    });
});

// Stripe Webhook (outside auth middleware)
Route::post('/stripe/webhook', [SubscriptionController::class, 'handleWebhook'])->name('cashier.webhook');
