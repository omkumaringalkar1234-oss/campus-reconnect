import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Linking,
  Platform,
  Image,
  Alert,
} from 'react-native';

import { Glass } from '@/constants/glass-theme';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { DataService } from '@/services/data-service';
import { PaymentService } from '@/services/payment-service';
import { SoundService } from '@/services/sound-service';
import { FoodItem, Order, PaymentMethod, FoodCourtPayoutConfig, OrderStatus } from '@/types';
import {
  GlassCard,
  GlassView,
  GlassBadge,
  GlassPill,
  GlassButton,
  GlassModal,
  GlassAvatar,
  GlassSectionHeader,
} from '@/components/ui/glass-components';

export default function CanteenScreen() {
  const router = useRouter();
  const { college, profile } = useAuth();
  const { glass } = useAppTheme();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('UPI');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // UPI Gateway State
  const [payoutConfig, setPayoutConfig] = useState<FoodCourtPayoutConfig | null>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiOrderId, setUpiOrderId] = useState<string>('');
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [upiUriString, setUpiUriString] = useState<string>('');
  const [upiRefInput, setUpiRefInput] = useState<string>('');
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [upiFeedback, setUpiFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Order History State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const prevOrderStatusesRef = React.useRef<Record<string, OrderStatus>>({});
  const isInitialStudentLoadRef = React.useRef<boolean>(true);

  const categories = ['All', 'Popular', 'Quick Bites', 'Drinks', 'Meals'];

  const loadMenuAndHistory = async () => {
    const activeCollegeId = college?.id || 'col_jspm_tathawade';
    const activeStudentUid = profile?.uid || '';
    try {
      const [items, ords, config] = await Promise.all([
        DataService.getFoodItems(activeCollegeId, activeCategory),
        DataService.getOrders(activeCollegeId, activeStudentUid),
        DataService.getPayoutConfig('fc_jspm_main'),
      ]);

      // Trigger order ready chime when food is ready for student pickup
      if (isInitialStudentLoadRef.current) {
        ords.forEach((o) => {
          prevOrderStatusesRef.current[o.id] = o.orderStatus;
        });
        isInitialStudentLoadRef.current = false;
      } else {
        const newlyReadyOrders = ords.filter((o) => {
          const prevStatus = prevOrderStatusesRef.current[o.id];
          return o.orderStatus === 'ready' && prevStatus && prevStatus !== 'ready';
        });

        if (newlyReadyOrders.length > 0) {
          SoundService.playOrderReadyChime();
        }

        ords.forEach((o) => {
          prevOrderStatusesRef.current[o.id] = o.orderStatus;
        });
      }

      setFoodItems(items);
      setMyOrders(ords);
      setPayoutConfig(config);
    } catch (e) {
      console.error('Error loading food menu:', e);
    }
  };

  useEffect(() => {
    loadMenuAndHistory();
    const interval = setInterval(loadMenuAndHistory, 3000);
    let handleStorage: any;
    if (typeof window !== 'undefined') {
      handleStorage = (e: StorageEvent) => {
        if (e.key === 'cc_orders') {
          loadMenuAndHistory();
        }
      };
      window.addEventListener('storage', handleStorage);
    }
    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined' && handleStorage) {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, [college, activeCategory, profile]);

  const activeOrders = myOrders.filter((o) => o.orderStatus !== 'completed');

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return '🕒 Order Placed';
      case 'accepted':
        return '👨‍🍳 Accepted';
      case 'preparing':
        return '🔥 Preparing';
      case 'ready':
        return '🔔 Ready for Pickup!';
      default:
        return status.toUpperCase();
    }
  };

  const getStatusVariant = (status: OrderStatus): 'teal' | 'gold' | 'purple' | 'info' => {
    switch (status) {
      case 'ready':
        return 'teal';
      case 'preparing':
        return 'gold';
      case 'accepted':
        return 'info';
      default:
        return 'purple';
    }
  };

  const addToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const cartTotalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const cartSubtotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = foodItems.find((i) => i.id === itemId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handlePlaceOrder = async () => {
    if (cartTotalItems === 0 || !college || !profile) return;

    try {
      setSubmittingOrder(true);
      const itemsToOrder = Object.entries(cart).map(([itemId, quantity]) => ({
        itemId,
        quantity,
      }));

      const studentIdentifier = `${profile.rollNumber ? `Roll: ${profile.rollNumber}` : '3104'} · ${
        profile.division || 'Div A'
      }${profile.department ? ` · ${profile.department}` : ''}`;

      const newOrder = await DataService.createOrder({
        collegeId: college.id,
        foodCourtId: 'fc_jspm_main',
        studentUid: profile.uid,
        studentName: profile.name || 'Student Customer',
        studentIdentifier,
        items: itemsToOrder,
        paymentMethod: selectedPaymentMethod,
      });

      if (selectedPaymentMethod === 'UPI') {
        const upiResult = await PaymentService.initiateUpiPayment({
          orderId: newOrder.id,
          collegeId: college.id,
          studentUid: profile.uid,
          amount: newOrder.total,
          payeeVpa: payoutConfig?.upiVpa,
          payeeName: payoutConfig?.businessName,
          foodCourtId: newOrder.foodCourtId,
        });

        setUpiOrderId(newOrder.id);
        setUpiAmount(newOrder.total);
        setUpiUriString(upiResult.upiUri);
        setUpiRefInput(`UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`);
        setCart({});
        setCartModalVisible(false);
        setShowUpiModal(true);
        setConfirmedOrder(newOrder);
      } else {
        await PaymentService.initiateCashPayment(newOrder.id, college.id, profile.uid, newOrder.total);
        setConfirmedOrder(newOrder);
        setCart({});
        setCartModalVisible(false);
      }

      await loadMenuAndHistory();
    } catch (err: any) {
      alert(err?.message || 'Failed to place order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleOpenOnlinePaymentForOrder = async (order: Order) => {
    try {
      const upiResult = await PaymentService.initiateUpiPayment({
        orderId: order.id,
        collegeId: order.collegeId,
        studentUid: profile?.uid || order.studentUid,
        amount: order.total,
        payeeVpa: payoutConfig?.upiVpa,
        payeeName: payoutConfig?.businessName,
        foodCourtId: order.foodCourtId,
      });

      setUpiOrderId(order.id);
      setUpiAmount(order.total);
      setUpiUriString(upiResult.upiUri);
      setUpiRefInput(`UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`);
      setShowUpiModal(true);
    } catch (e: any) {
      alert(e.message || 'Could not initiate online payment');
    }
  };

  const handleCancelOrder = (orderId: string) => {
    const doCancel = async () => {
      try {
        await DataService.cancelOrder(orderId, 'Cancelled by student (mistaken order)', profile?.uid);
        await loadMenuAndHistory();
        if (Platform.OS === 'web') {
          alert('Order was cancelled successfully.');
        } else {
          Alert.alert('Order Cancelled', 'Your order has been cancelled.');
        }
      } catch (err: any) {
        alert(err.message || 'Could not cancel order');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this order? If you ordered mistakenly, this will immediately cancel it.')) {
        doCancel();
      }
    } else {
      Alert.alert(
        'Cancel Order',
        'Are you sure you want to cancel this order? If you ordered mistakenly, this will immediately cancel it.',
        [
          { text: 'Keep Order', style: 'cancel' },
          { text: 'Yes, Cancel Order', style: 'destructive', onPress: doCancel },
        ]
      );
    }
  };

  const handleVerifyUpi = async () => {
    if (!upiOrderId || !upiRefInput.trim()) return;
    try {
      setUpiVerifying(true);
      setUpiFeedback(null);
      const res = await PaymentService.verifyUpiPayment(upiOrderId, upiRefInput.trim());
      setUpiFeedback(res);
      if (res.success) {
        setTimeout(() => {
          setShowUpiModal(false);
          setUpiFeedback(null);
        }, 1200);
      }
      await loadMenuAndHistory();
    } catch (e: any) {
      setUpiFeedback({ success: false, message: e.message || 'Verification failed' });
    } finally {
      setUpiVerifying(false);
    }
  };

  const getItemIcon = (cat: string, name: string) => {
    if (cat === 'Drinks' || name.toLowerCase().includes('coffee') || name.toLowerCase().includes('tea') || name.toLowerCase().includes('chai')) {
      return 'cafe';
    }
    if (cat === 'Meals' || name.toLowerCase().includes('thali') || name.toLowerCase().includes('dosa')) {
      return 'restaurant';
    }
    return 'fast-food';
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Popular': return 'trending-up';
      case 'Quick Bites': return 'flash';
      case 'Drinks': return 'wine';
      case 'Meals': return 'restaurant';
      default: return 'grid';
    }
  };

  return (
    <View style={styles.safeContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandSubtitle}>CAMPUS CONNECT CANTEEN</Text>
            <Text style={styles.screenHeading}>Today's menu</Text>
            <View style={styles.ownerHeaderBadge}>
              <Ionicons name="restaurant-outline" size={13} color={glass.purple} />
              <Text style={styles.ownerHeaderBadgeText}>
                {payoutConfig?.businessName || 'JSPM Food Court'} • Owner:{' '}
                <Text style={{ color: glass.purple, fontWeight: Glass.fontWeight.extrabold }}>
                  {payoutConfig?.accountHolderName || 'Suresh Patil'}
                </Text>
              </Text>
            </View>
          </View>
          <View style={styles.headerRightActions}>
            {cartTotalItems > 0 && (
              <Pressable
                style={styles.headerCartBtn}
                onPress={() => setCartModalVisible(true)}
              >
                <View style={styles.headerCartIcon}>
                  <Ionicons name="cart" size={15} color={glass.bg} />
                </View>
                <Text style={styles.headerCartBtnText}>
                  {cartTotalItems} · ₹{cartSubtotal}
                </Text>
              </Pressable>
            )}
            <Pressable
              style={styles.historyBtn}
              onPress={() => setShowHistoryModal(true)}
            >
              <Ionicons name="receipt-outline" size={16} color={glass.purple} />
              <Text style={styles.historyBtnText}>Orders</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.screenSub}>
          Order fresh food ahead, avoid queues, and pick up easily with your 4-digit code.
        </Text>

        {/* ACTIVE ORDER LIVE TRACKER BANNER */}
        {activeOrders.length > 0 && (
          <GlassCard variant="elevated" style={styles.activeOrderBanner}>
            <View style={styles.activeOrderHeader}>
              <View style={styles.activeOrderHeaderLeft}>
                <View style={styles.activeOrderPulse} />
                <Text style={styles.activeOrderHeading}>LIVE ORDER IN PROGRESS</Text>
              </View>
              <GlassBadge variant={getStatusVariant(activeOrders[0].orderStatus)} size="md">
                {getStatusLabel(activeOrders[0].orderStatus)}
              </GlassBadge>
            </View>

            <View style={styles.activeOrderBody}>
              <View style={styles.activeOrderMainRow}>
                <View style={{ flex: 1, paddingRight: Glass.space.md }}>
                  <Text style={styles.activeOrderNumber}>{activeOrders[0].orderNumber}</Text>
                  <Text style={styles.activeOrderOwnerText}>
                    {payoutConfig?.businessName || 'JSPM Canteen'} • Owner:{' '}
                    <Text style={{ color: glass.text, fontWeight: Glass.fontWeight.bold }}>
                      {payoutConfig?.accountHolderName || 'Suresh Patil'}
                    </Text>
                  </Text>
                  <Text style={styles.activeOrderItemsSummary} numberOfLines={1}>
                    {activeOrders[0].items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                  </Text>
                </View>

                <View style={styles.activeOtpCard}>
                  <Text style={styles.activeOtpLabel}>PICKUP OTP</Text>
                  <Text style={styles.activeOtpCode}>{activeOrders[0].pickupOtp}</Text>
                </View>
              </View>

              {/* PAYMENT STATUS & ONLINE PAYMENT OPTION */}
              <View style={styles.activePaymentRow}>
                <View style={styles.activePaymentInfo}>
                  <Text style={styles.activePaymentTotal}>Total: ₹{activeOrders[0].total}</Text>
                  <Text style={styles.activePaymentMethodText}>
                    {activeOrders[0].paymentMethod === 'UPI' &&
                    activeOrders[0].paymentStatus === 'paid'
                      ? '✅ Paid via Online UPI'
                      : '💵 Cash at Counter (OTP optional)'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {activeOrders[0].paymentStatus === 'cash_pending' && (
                    <GlassButton
                      variant="primary"
                      size="sm"
                      leftIcon={<Ionicons name="flash" size={13} color={glass.bg} />}
                      onPress={() => handleOpenOnlinePaymentForOrder(activeOrders[0])}
                    >
                      Pay Online via UPI
                    </GlassButton>
                  )}
                  {(activeOrders[0].orderStatus === 'placed' || activeOrders[0].orderStatus === 'accepted') && (
                    <GlassButton
                      variant="danger"
                      size="sm"
                      leftIcon={<Ionicons name="close-circle-outline" size={14} color="#fff" />}
                      onPress={() => handleCancelOrder(activeOrders[0].id)}
                    >
                      Cancel Order
                    </GlassButton>
                  )}
                </View>
              </View>
            </View>
          </GlassCard>
        )}

        {/* CATEGORY PILLS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          style={styles.categoryScrollView}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <GlassPill
                key={cat}
                selected={isActive}
                variant="purple"
                onPress={() => setActiveCategory(cat)}
                style={styles.categoryPill}
              >
                {cat}
              </GlassPill>
            );
          })}
        </ScrollView>

        {/* MENU LIST */}
        <View style={styles.menuList}>
          {foodItems.map((item) => {
            const qtyInCart = cart[item.id] || 0;
            return (
              <GlassCard
                key={item.id}
                variant="interactive"
                style={[styles.foodCard, { backgroundColor: Glass.bgCard, borderColor: Glass.border }]}
              >
                <View style={[styles.foodIconBox, { backgroundColor: Glass.purpleDim }]}>
                  <Ionicons
                    name={getItemIcon(item.category, item.name)}
                    size={28}
                    color={glass.purple}
                  />
                </View>

                <View style={styles.foodInfo}>
                  <GlassBadge variant="purple" size="sm" style={styles.prepBadge}>
                    {item.prepTimeMinutes} min
                  </GlassBadge>

                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.foodBottomRow}>
                    <Text style={styles.foodPrice}>₹{item.price}</Text>

                    {qtyInCart > 0 ? (
                      <View style={styles.stepperBox}>
                        <Pressable
                          style={styles.stepperBtn}
                          onPress={() => removeFromCart(item.id)}
                        >
                          <Ionicons name="remove" size={14} color={glass.text} />
                        </Pressable>
                        <Text style={styles.stepperQty}>{qtyInCart}</Text>
                        <Pressable
                          style={styles.stepperBtn}
                          onPress={() => addToCart(item.id)}
                        >
                          <Ionicons name="add" size={14} color={glass.text} />
                        </Pressable>
                      </View>
                    ) : (
                      <GlassButton
                        variant="primary"
                        size="sm"
                        onPress={() => addToCart(item.id)}
                        style={styles.addBtn}
                      >
                        + Add
                      </GlassButton>
                    )}
                  </View>
                </View>
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>

      {/* FLOATING CART BAR */}
      {cartTotalItems > 0 && (
        <View style={styles.floatingCartContainer}>
          <Pressable
            style={styles.floatingCartBar}
            onPress={() => setCartModalVisible(true)}
          >
            <View style={styles.cartBarLeft}>
              <View style={styles.cartCountCircle}>
                <Text style={styles.cartCountText}>{cartTotalItems}</Text>
              </View>
              <Text style={styles.cartBarSummary}>
                {cartTotalItems} item{cartTotalItems > 1 ? 's' : ''} · ₹{cartSubtotal}
              </Text>
            </View>

            <View style={styles.cartBarRight}>
              <Text style={styles.viewCartText}>View Cart</Text>
              <Ionicons name="arrow-forward" size={16} color={glass.bg} />
            </View>
          </Pressable>
        </View>
      )}

      {/* CART & CHECKOUT MODAL */}
      <GlassModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
        size="lg"
      >
        <View style={styles.cartModalContainer}>
          <View style={styles.cartModalHeader}>
            <View>
              <Text style={styles.cartModalTitle}>Your Order</Text>
              <Text style={styles.cartModalSub}>
                {payoutConfig?.businessName || 'JSPM Food Court'} • Owner:{' '}
                {payoutConfig?.accountHolderName || 'Suresh Patil'}
              </Text>
            </View>
            <Pressable
              style={styles.closeCartBtn}
              onPress={() => setCartModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={glass.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.cartItemsScroll}>
            {Object.entries(cart).map(([itemId, qty]) => {
              const item = foodItems.find((i) => i.id === itemId);
              if (!item) return null;
              return (
                <View key={itemId} style={styles.cartItemRow}>
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>
                      ₹{item.price} × {qty} = ₹{item.price * qty}
                    </Text>
                  </View>

                  <View style={styles.cartStepper}>
                    <Pressable
                      style={styles.cartStepperBtn}
                      onPress={() => removeFromCart(itemId)}
                    >
                      <Ionicons name="remove" size={14} color={glass.text} />
                    </Pressable>
                    <Text style={styles.cartStepperCount}>{qty}</Text>
                    <Pressable
                      style={styles.cartStepperBtn}
                      onPress={() => addToCart(itemId)}
                    >
                      <Ionicons name="add" size={14} color={glass.text} />
                    </Pressable>
                  </View>
                </View>
              );
            })}

            {/* PAYMENT METHOD SELECTOR */}
            <View style={styles.paymentSection}>
              <Text style={styles.paymentSectionTitle}>Select Payment Method</Text>

              <View style={styles.paymentOptionsRow}>
                <Pressable
                  style={[
                    styles.paymentOptionCard,
                    selectedPaymentMethod === 'UPI' && styles.activePaymentOption,
                  ]}
                  onPress={() => setSelectedPaymentMethod('UPI')}
                >
                  <Ionicons
                    name="qr-code-outline"
                    size={24}
                    color={
                      selectedPaymentMethod === 'UPI'
                        ? glass.purple
                        : glass.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.paymentOptionName,
                      selectedPaymentMethod === 'UPI' && styles.activePaymentText,
                    ]}
                  >
                    UPI Instant
                  </Text>
                  <Text style={styles.paymentOptionDesc}>Verified UPI Gateway</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.paymentOptionCard,
                    selectedPaymentMethod === 'CASH' && styles.activePaymentOption,
                  ]}
                  onPress={() => setSelectedPaymentMethod('CASH')}
                >
                  <Ionicons
                    name="cash-outline"
                    size={24}
                    color={
                      selectedPaymentMethod === 'CASH'
                        ? glass.purple
                        : glass.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.paymentOptionName,
                      selectedPaymentMethod === 'CASH' && styles.activePaymentText,
                    ]}
                  >
                    Cash At Pickup
                  </Text>
                  <Text style={styles.paymentOptionDesc}>Pay cash at counter • OTP optional</Text>
                </Pressable>
              </View>

              <GlassView variant="default" style={styles.billBreakdown}>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Item Subtotal</Text>
                  <Text style={styles.billValue}>₹{cartSubtotal}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Convenience & Tax</Text>
                  <Text style={styles.billValue}>₹0</Text>
                </View>
                <View style={[styles.billRow, styles.billRowTotal]}>
                  <Text style={styles.billTotalLabel}>Total to Pay</Text>
                  <Text style={styles.billTotalValue}>₹{cartSubtotal}</Text>
                </View>
              </GlassView>
            </View>
          </ScrollView>

          {/* CHECKOUT BUTTON */}
          <View style={styles.checkoutFooter}>
            <GlassButton
              variant="primary"
              size="lg"
              onPress={handlePlaceOrder}
              disabled={submittingOrder}
              style={styles.checkoutBtn}
            >
              {submittingOrder ? (
                <ActivityIndicator color={glass.bg} />
              ) : (
                <Text style={styles.checkoutBtnText}>
                  Place Order • ₹{cartSubtotal}
                </Text>
              )}
            </GlassButton>
          </View>
        </View>
      </GlassModal>

      {/* VERIFIED UPI GATEWAY MODAL */}
      <GlassModal
        visible={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        size="lg"
      >
        <View style={styles.confirmCard}>
          <View style={styles.upiIconHeader}>
            <Ionicons name="qr-code" size={36} color={glass.purple} />
          </View>

          <Text style={styles.confirmTitle}>UPI Payment Verification</Text>
          <Text style={styles.upiAmountText}>Amount: ₹{upiAmount}</Text>

          {/* DYNAMIC FOOD COURT BANK & VPA CARD */}
          <GlassView variant="default" style={styles.upiBankCard}>
            <View style={styles.upiBankHeader}>
              <Text style={styles.upiBankName}>
                {payoutConfig?.businessName || 'JSPM Central Food Court'}
              </Text>
              <GlassBadge variant="teal" size="xs">DIRECT BANK DEPOSIT</GlassBadge>
            </View>

            <Text style={styles.upiBankDetail}>
              Receiving Bank:{' '}
              <Text style={{ color: glass.text, fontWeight: Glass.fontWeight.extrabold }}>
                {payoutConfig?.bankName || 'HDFC Bank'}
              </Text>{' '}
              (A/C ending ••••
              {payoutConfig?.accountNumber
                ? payoutConfig.accountNumber.slice(-4)
                : '9283'}
              )
            </Text>

            <Text style={styles.upiBankDetail}>
              Payee UPI ID:{' '}
              <Text style={{ color: glass.purple, fontWeight: Glass.fontWeight.extrabold }}>
                {payoutConfig?.upiVpa || 'campusconnect.canteen@okhdfcbank'}
              </Text>
            </Text>
          </GlassView>

          {/* LIVE SCANNABLE DYNAMIC UPI QR CODE */}
          <View style={styles.upiQrWrapper}>
            <View style={styles.upiQrFrame}>
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    upiUriString ||
                      `upi://pay?pa=${
                        payoutConfig?.upiVpa || 'suresh.canteen@okhdfcbank'
                      }&pn=${encodeURIComponent(
                        payoutConfig?.businessName || 'JSPM Food Court'
                      )}&am=${upiAmount}&cu=INR`
                  )}`,
                }}
                style={styles.upiQrImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.upiQrHint}>
              SCAN WITH ANY UPI APP (GPAY · PHONEPE · PAYTM · BHIM)
            </Text>
          </View>

          {/* 1-CLICK PAY VIA UPI APP BUTTON */}
          <Pressable
            style={styles.upiQuickPayBtn}
            onPress={() => {
              const uri =
                upiUriString ||
                `upi://pay?pa=${
                  payoutConfig?.upiVpa || 'suresh.canteen@okhdfcbank'
                }&pn=${encodeURIComponent(
                  payoutConfig?.businessName || 'JSPM Food Court'
                )}&am=${upiAmount}&cu=INR`;
              Linking.openURL(uri).catch(() => {
                alert('Could not launch UPI app. Please scan the QR code above.');
              });
            }}
          >
            <Ionicons name="flash" size={15} color={glass.purple} />
            <Text style={styles.upiQuickPayText}>Pay via GPay / PhonePe / Paytm App</Text>
          </Pressable>

          <View style={styles.upiRefInputBox}>
            <Text style={styles.upiRefLabel}>BANK UTR / REFERENCE ID</Text>
            <TextInput
              style={styles.upiInput}
              value={upiRefInput}
              onChangeText={setUpiRefInput}
              placeholder="Enter 12-digit UTR"
              placeholderTextColor={glass.textDim}
            />
          </View>

          {upiFeedback && (
            <GlassView
              variant="default"
              style={[
                styles.upiFeedback,
                upiFeedback.success ? styles.upiSuccess : styles.upiError,
              ]}
            >
              <Text
                style={[
                  styles.upiFeedbackText,
                  upiFeedback.success ? styles.upiSuccessText : styles.upiErrorText,
                ]}
              >
                {upiFeedback.message}
              </Text>
            </GlassView>
          )}

          <GlassButton
            variant="primary"
            size="lg"
            onPress={handleVerifyUpi}
            disabled={upiVerifying}
            style={styles.verifyPayBtn}
          >
            {upiVerifying ? (
              <ActivityIndicator color={glass.bg} />
            ) : (
              <Text style={styles.verifyPayBtnText}>Confirm & Verify Payment</Text>
            )}
          </GlassButton>
        </View>
      </GlassModal>

      {/* CONFIRMED ORDER & OTP DIALOG */}
      <GlassModal
        visible={!!confirmedOrder && !showUpiModal}
        onClose={() => setConfirmedOrder(null)}
        size="md"
      >
        {confirmedOrder && (
          <View style={styles.confirmCard}>
            <View style={styles.confirmCheckCircle}>
              <Ionicons name="checkmark" size={32} color={glass.bg} />
            </View>

            <Text style={styles.confirmTitle}>Order Placed Successfully!</Text>
            <Text style={styles.confirmOrderNumber}>{confirmedOrder.orderNumber}</Text>

            <View style={styles.confirmOutletBox}>
              <Ionicons name="restaurant-outline" size={14} color={glass.purple} />
              <Text style={styles.confirmOutletText}>
                {payoutConfig?.businessName || 'JSPM Food Court'} • Owner:{' '}
                <Text style={{ fontWeight: Glass.fontWeight.extrabold, color: glass.purple }}>
                  {payoutConfig?.accountHolderName || 'Suresh Patil'}
                </Text>
              </Text>
            </View>

            <Text style={styles.confirmDesc}>
              {confirmedOrder.paymentMethod === 'CASH'
                ? `Your order is sent to the canteen! Pay ₹${confirmedOrder.total} cash at the counter to collect your food. (OTP is not mandatory for cash orders). You can also switch to online payment anytime.`
                : `Your order is sent to the canteen! Show this 4-digit code at the counter when your food is ready:`}
            </Text>

            <GlassView variant="default" style={styles.confirmOtpBox}>
              <Text style={styles.confirmOtpLabel}>YOUR 4-DIGIT PICKUP OTP</Text>
              <Text style={styles.confirmOtpCode}>{confirmedOrder.pickupOtp}</Text>
            </GlassView>

            <GlassView
              variant="default"
              style={[
                styles.confirmPaymentPill,
                confirmedOrder.paymentMethod === 'CASH'
                  ? styles.confirmPaymentCash
                  : styles.confirmPaymentUpi,
              ]}
            >
              <Text
                style={[
                  styles.confirmPaymentPillText,
                  confirmedOrder.paymentMethod === 'CASH'
                    ? styles.confirmPaymentCashText
                    : styles.confirmPaymentUpiText,
                ]}
              >
                {confirmedOrder.paymentMethod === 'CASH'
                  ? `💵 Cash at Counter: ₹${confirmedOrder.total}`
                  : `✅ Paid Online via UPI: ₹${confirmedOrder.total}`}
              </Text>
            </GlassView>

            <GlassButton
              variant="primary"
              size="md"
              onPress={() => setConfirmedOrder(null)}
              style={styles.doneBtn}
            >
              View & Track on Menu
            </GlassButton>
          </View>
        )}
      </GlassModal>

      {/* ORDER HISTORY MODAL */}
      <GlassModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        size="lg"
      >
        <View style={styles.cartModalContainer}>
          <View style={styles.cartModalHeader}>
            <View>
              <Text style={styles.cartModalTitle}>Order History</Text>
              <Text style={styles.cartModalSub}>Past Canteen Orders & Receipts</Text>
            </View>
            <Pressable
              style={styles.closeCartBtn}
              onPress={() => setShowHistoryModal(false)}
            >
              <Ionicons name="close" size={24} color={glass.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.cartItemsScroll}>
            {myOrders.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: Glass.space.xl }}>
                <Text style={{ color: glass.textMuted }}>No previous orders found.</Text>
              </View>
            ) : (
              myOrders.map((ord) => (
                <GlassCard key={ord.id} variant="default" style={styles.historyCard}>
                  <View style={styles.historyTop}>
                    <Text style={styles.historyOrderNum}>{ord.orderNumber}</Text>
                    <GlassBadge variant={getStatusVariant(ord.orderStatus)} size="sm">
                      {ord.orderStatus.toUpperCase()}
                    </GlassBadge>
                  </View>

                  <Text style={styles.historyItemsText}>
                    {ord.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                  </Text>

                  <View style={styles.historyBottom}>
                    <Text style={styles.historyTotal}>Total: ₹{ord.total}</Text>
                    <Text style={styles.historyPayText}>
                      {ord.paymentMethod} • {ord.paymentStatus.toUpperCase()}
                    </Text>
                  </View>

                  {ord.pickupOtp && (
                    <View style={styles.historyOtpRow}>
                      <Text style={styles.historyOtpLabel}>Pickup OTP: </Text>
                      <Text style={styles.historyOtpValue}>{ord.pickupOtp}</Text>
                    </View>
                  )}
                </GlassCard>
              ))
            )}
          </ScrollView>
        </View>
      </GlassModal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Glass.bg,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Glass.space.md,
    paddingTop: 54,
    paddingBottom: 210,
    maxWidth: Glass.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.sm,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.sm,
  },
  headerCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.xs,
    backgroundColor: Glass.purpleBright,
    paddingHorizontal: Glass.space.sm,
    paddingVertical: Glass.space.xs,
    borderRadius: Glass.radius.md,
  },
  headerCartIcon: {
    width: 28,
    height: 28,
    borderRadius: Glass.radius.circle,
    backgroundColor: Glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCartBtnText: {
    color: Glass.bg,
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.extrabold,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.xs,
    backgroundColor: Glass.bgCard,
    paddingHorizontal: Glass.space.sm,
    paddingVertical: Glass.space.xs,
    borderRadius: Glass.radius.md,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  historyBtnText: {
    color: Glass.purple,
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.bold,
  },
  brandSubtitle: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
    letterSpacing: 1.2,
    marginBottom: Glass.space.xs,
  },
  screenHeading: {
    fontSize: Glass.fontSize.display,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    letterSpacing: -0.5,
  },
  screenSub: {
    fontSize: Glass.fontSize.md,
    color: Glass.textMuted,
    marginTop: Glass.space.sm,
    marginBottom: Glass.space.lg,
  },
  ownerHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.xs,
    marginTop: Glass.space.sm,
    backgroundColor: Glass.purpleDim,
    paddingHorizontal: Glass.space.sm,
    paddingVertical: Glass.space.xs,
    borderRadius: Glass.radius.sm,
    alignSelf: 'flex-start',
  },
  ownerHeaderBadgeText: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.semibold,
    color: Glass.textMuted,
  },
  categoryScrollView: {
    marginBottom: Glass.space.xl,
  },
  categoryScroll: {
    gap: Glass.space.sm,
    paddingRight: Glass.space.md,
  },
  categoryPill: {
    paddingHorizontal: Glass.space.md,
    paddingVertical: Glass.space.xs,
  },
  menuList: {
    gap: Glass.space.md,
  },
  foodCard: {
    flexDirection: 'row',
    borderRadius: Glass.radius.xl,
    padding: Glass.space.md,
    gap: Glass.space.md,
    borderWidth: 1,
  },
  foodIconBox: {
    width: 68,
    height: 68,
    borderRadius: Glass.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  prepBadge: {
    marginBottom: Glass.space.sm,
    alignSelf: 'flex-start',
  },
  foodName: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.xs,
  },
  foodDesc: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    lineHeight: Glass.lineHeight.normal * Glass.fontSize.sm,
    marginBottom: Glass.space.md,
  },
  foodBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    fontSize: Glass.fontSize.xl,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  addBtn: {
    minWidth: 80,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Glass.purpleBright,
    borderRadius: Glass.radius.md,
    paddingHorizontal: Glass.space.xs,
    paddingVertical: Glass.space.xs,
    gap: Glass.space.sm,
  },
  stepperBtn: {
    padding: Glass.space.xs,
  },
  stepperQty: {
    color: Glass.bg,
    fontWeight: Glass.fontWeight.extrabold,
    fontSize: Glass.fontSize.md,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 128 : 110,
    left: Glass.space.md,
    right: Glass.space.md,
    alignItems: 'center',
    zIndex: Glass.zIndex.floating,
  },
  floatingCartBar: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: Glass.purpleBright,
    borderRadius: Glass.radius.xl,
    paddingVertical: Glass.space.md,
    paddingHorizontal: Glass.space.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Glass.btnShadow,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.sm,
  },
  cartCountCircle: {
    width: 26,
    height: 26,
    borderRadius: Glass.radius.circle,
    backgroundColor: Glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    color: Glass.purpleBright,
    fontWeight: Glass.fontWeight.extrabold,
    fontSize: Glass.fontSize.sm,
  },
  cartBarSummary: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.bg,
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.xs,
  },
  viewCartText: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.bg,
  },
  cartModalContainer: {
    flex: 1,
    backgroundColor: Glass.bg,
  },
  cartModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Glass.space.md,
    paddingTop: Glass.space.lg,
    borderBottomWidth: 1,
    borderBottomColor: Glass.border,
  },
  cartModalTitle: {
    fontSize: Glass.fontSize.xl,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  cartModalSub: {
    fontSize: Glass.fontSize.sm,
    color: Glass.purple,
    marginTop: Glass.space.xs,
    fontWeight: Glass.fontWeight.semibold,
  },
  closeCartBtn: {
    width: 36,
    height: 36,
    borderRadius: Glass.radius.circle,
    backgroundColor: Glass.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartItemsScroll: {
    flex: 1,
    padding: Glass.space.md,
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Glass.space.md,
    borderBottomWidth: 1,
    borderBottomColor: Glass.borderSubtle,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.bold,
    color: Glass.text,
    marginBottom: Glass.space.xs,
  },
  cartItemPrice: {
    fontSize: Glass.fontSize.sm,
    color: Glass.purple,
    fontWeight: Glass.fontWeight.semibold,
  },
  cartStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Glass.bgCard,
    borderRadius: Glass.radius.md,
    paddingHorizontal: Glass.space.xs,
    paddingVertical: Glass.space.xs,
    gap: Glass.space.sm,
  },
  cartStepperBtn: {
    padding: Glass.space.xs,
  },
  cartStepperCount: {
    color: Glass.text,
    fontWeight: Glass.fontWeight.bold,
    fontSize: Glass.fontSize.md,
  },
  paymentSection: {
    marginTop: Glass.space.xl,
    marginBottom: Glass.space.xl,
  },
  paymentSectionTitle: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.md,
  },
  paymentOptionsRow: {
    flexDirection: 'row',
    gap: Glass.space.md,
    marginBottom: Glass.space.xl,
  },
  paymentOptionCard: {
    flex: 1,
    backgroundColor: Glass.bgCard,
    borderRadius: Glass.radius.lg,
    padding: Glass.space.md,
    borderWidth: 1,
    borderColor: Glass.border,
    alignItems: 'center',
  },
  activePaymentOption: {
    borderColor: Glass.purple,
    backgroundColor: Glass.purpleDim,
  },
  paymentOptionName: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginTop: Glass.space.sm,
  },
  activePaymentText: {
    color: Glass.purple,
  },
  paymentOptionDesc: {
    fontSize: Glass.fontSize.xs,
    color: Glass.textMuted,
    marginTop: Glass.space.xs,
    textAlign: 'center',
  },
  billBreakdown: {
    padding: Glass.space.md,
    gap: Glass.space.sm,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billLabel: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
  },
  billValue: {
    fontSize: Glass.fontSize.sm,
    color: Glass.text,
    fontWeight: Glass.fontWeight.semibold,
  },
  billRowTotal: {
    borderTopWidth: 1,
    borderTopColor: Glass.borderSubtle,
    paddingTop: Glass.space.md,
    marginTop: Glass.space.sm,
  },
  billTotalLabel: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  billTotalValue: {
    fontSize: Glass.fontSize.xl,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
  },
  checkoutFooter: {
    padding: Glass.space.md,
    borderTopWidth: 1,
    borderTopColor: Glass.border,
    backgroundColor: Glass.bgElevated,
  },
  checkoutBtn: {
    width: '100%',
  },
  checkoutBtnText: {
    color: Glass.bg,
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Glass.space.md,
  },
  confirmCard: {
    backgroundColor: Glass.bgModalCard,
    borderRadius: Glass.radius.xxl,
    padding: Glass.space.xl,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Glass.borderStrong,
  },
  upiIconHeader: {
    marginBottom: Glass.space.md,
  },
  confirmTitle: {
    fontSize: Glass.fontSize.xl,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    textAlign: 'center',
  },
  upiAmountText: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.bold,
    color: Glass.textSub,
    marginBottom: Glass.space.lg,
  },
  upiBankCard: {
    width: '100%',
    marginVertical: Glass.space.md,
  },
  upiBankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Glass.space.sm,
  },
  upiBankName: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  upiBankDetail: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginTop: Glass.space.sm,
  },
  upiQrWrapper: {
    alignItems: 'center',
    marginVertical: Glass.space.md,
  },
  upiQrFrame: {
    padding: Glass.space.sm,
    backgroundColor: Glass.text,
    borderRadius: Glass.radius.lg,
    ...Glass.cardShadowElevated,
  },
  upiQrImage: {
    width: 150,
    height: 150,
    borderRadius: Glass.radius.sm,
  },
  upiQrHint: {
    fontSize: Glass.fontSize.xs,
    color: Glass.textDim,
    marginTop: Glass.space.sm,
    fontWeight: Glass.fontWeight.bold,
  },
  upiQuickPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Glass.space.sm,
    backgroundColor: Glass.bgElevated,
    borderWidth: 1,
    borderColor: Glass.purple,
    paddingVertical: Glass.space.sm,
    borderRadius: Glass.radius.md,
    marginBottom: Glass.space.md,
    width: '100%',
  },
  upiQuickPayText: {
    color: Glass.purple,
    fontWeight: Glass.fontWeight.extrabold,
    fontSize: Glass.fontSize.sm,
  },
  upiRefInputBox: {
    marginBottom: Glass.space.md,
  },
  upiRefLabel: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
    letterSpacing: 0.5,
    marginBottom: Glass.space.xs,
  },
  upiInput: {
    backgroundColor: Glass.bgInput,
    borderRadius: Glass.radius.md,
    borderWidth: 1,
    borderColor: Glass.border,
    paddingHorizontal: Glass.space.md,
    paddingVertical: Glass.space.sm,
    color: Glass.text,
    fontSize: Glass.fontSize.md,
  },
  upiFeedback: {
    padding: Glass.space.md,
    borderRadius: Glass.radius.md,
    marginBottom: Glass.space.md,
  },
  upiSuccess: {
    backgroundColor: Glass.successDim,
    borderWidth: 1,
    borderColor: Glass.successBorder,
  },
  upiError: {
    backgroundColor: Glass.dangerDim,
    borderWidth: 1,
    borderColor: Glass.dangerBorder,
  },
  upiFeedbackText: {
    fontSize: Glass.fontSize.sm,
    textAlign: 'center',
  },
  upiSuccessText: {
    color: Glass.success,
  },
  upiErrorText: {
    color: Glass.danger,
  },
  verifyPayBtn: {
    width: '100%',
    marginTop: Glass.space.sm,
  },
  verifyPayBtnText: {
    color: Glass.bg,
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
  },
  confirmCheckCircle: {
    width: 60,
    height: 60,
    borderRadius: Glass.radius.circle,
    backgroundColor: Glass.purpleBright,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Glass.space.md,
  },
  confirmOrderNumber: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.bold,
    color: Glass.purple,
    marginTop: Glass.space.xs,
    marginBottom: Glass.space.md,
  },
  confirmDesc: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    textAlign: 'center',
    lineHeight: Glass.lineHeight.relaxed * Glass.fontSize.sm,
    marginBottom: Glass.space.xl,
  },
  confirmOtpBox: {
    backgroundColor: Glass.purpleDim,
    borderRadius: Glass.radius.lg,
    paddingVertical: Glass.space.md,
    paddingHorizontal: Glass.space.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Glass.purple,
    marginBottom: Glass.space.md,
    width: '100%',
  },
  confirmOtpLabel: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
    letterSpacing: 1,
    marginBottom: Glass.space.xs,
  },
  confirmOtpCode: {
    fontSize: 32,
    fontWeight: Glass.fontWeight.black,
    color: Glass.text,
    letterSpacing: 4,
  },
  confirmOutletBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.xs,
    backgroundColor: Glass.purpleDim,
    paddingHorizontal: Glass.space.sm,
    paddingVertical: Glass.space.xs,
    borderRadius: Glass.radius.sm,
    marginBottom: Glass.space.md,
  },
  confirmOutletText: {
    fontSize: Glass.fontSize.xs,
    color: Glass.textMuted,
  },
  confirmPaymentPill: {
    paddingHorizontal: Glass.space.md,
    paddingVertical: Glass.space.sm,
    borderRadius: Glass.radius.md,
    marginBottom: Glass.space.md,
    width: '100%',
    alignItems: 'center',
  },
  confirmPaymentCash: {
    backgroundColor: Glass.goldDim,
    borderWidth: 1,
    borderColor: Glass.gold,
  },
  confirmPaymentUpi: {
    backgroundColor: Glass.tealDim,
    borderWidth: 1,
    borderColor: Glass.teal,
  },
  confirmPaymentPillText: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.extrabold,
  },
  confirmPaymentCashText: {
    color: Glass.gold,
  },
  confirmPaymentUpiText: {
    color: Glass.teal,
  },
  doneBtn: {
    width: '100%',
    marginTop: Glass.space.sm,
  },
  // Active Order Live Tracker Banner
  activeOrderBanner: {
    borderRadius: Glass.radius.xl,
    borderWidth: 1.5,
    borderColor: Glass.purple,
    marginBottom: Glass.space.xl,
    overflow: 'hidden',
  },
  activeOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Glass.space.md,
    paddingVertical: Glass.space.sm,
    backgroundColor: Glass.purpleDim,
    borderBottomWidth: 1,
    borderBottomColor: Glass.border,
  },
  activeOrderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.sm,
  },
  activeOrderPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Glass.purplePink,
    // Animation handled by component
  },
  activeOrderHeading: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
    letterSpacing: 0.5,
  },
  activeOrderBody: {
    padding: Glass.space.md,
  },
  activeOrderMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Glass.space.md,
  },
  activeOrderNumber: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.xs,
  },
  activeOrderOwnerText: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginBottom: Glass.space.xs,
    lineHeight: Glass.lineHeight.normal * Glass.fontSize.sm,
  },
  activeOrderItemsSummary: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textSub,
    fontWeight: Glass.fontWeight.medium,
  },
  activeOtpCard: {
    backgroundColor: Glass.purpleDim,
    borderRadius: Glass.radius.lg,
    paddingHorizontal: Glass.space.md,
    paddingVertical: Glass.space.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Glass.purple,
    minWidth: 100,
  },
  activeOtpLabel: {
    fontSize: Glass.fontSize.xs,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
    letterSpacing: 0.5,
    marginBottom: Glass.space.xs,
  },
  activeOtpCode: {
    fontSize: Glass.fontSize.xl,
    fontWeight: Glass.fontWeight.black,
    color: Glass.text,
    letterSpacing: 2,
  },
  activePaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Glass.space.md,
  },
  activePaymentInfo: {
    flex: 1,
  },
  activePaymentTotal: {
    fontSize: Glass.fontSize.lg,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
    marginBottom: Glass.space.xs,
  },
  activePaymentMethodText: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
  },
  // History
  historyCard: {
    marginBottom: Glass.space.md,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.sm,
  },
  historyOrderNum: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  historyItemsText: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
    marginBottom: Glass.space.md,
  },
  historyBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Glass.space.sm,
  },
  historyTotal: {
    fontSize: Glass.fontSize.md,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.text,
  },
  historyPayText: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
  },
  historyOtpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Glass.space.xs,
    paddingTop: Glass.space.sm,
    borderTopWidth: 1,
    borderTopColor: Glass.borderSubtle,
  },
  historyOtpLabel: {
    fontSize: Glass.fontSize.sm,
    color: Glass.textMuted,
  },
  historyOtpValue: {
    fontSize: Glass.fontSize.sm,
    fontWeight: Glass.fontWeight.extrabold,
    color: Glass.purple,
  },
});