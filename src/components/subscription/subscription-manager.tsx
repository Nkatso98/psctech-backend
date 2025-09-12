import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { subscriptionManager, learnerStore, voucherStore, subscriptionStore } from '@/lib/store';
import { Learner, Subscription } from '@/lib/types';
import { CreditCardIcon, KeyIcon, CheckCircleIcon, XCircleIcon, RefreshCwIcon, CalendarIcon } from 'lucide-react';

export function SubscriptionManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [redeemStatus, setRedeemStatus] = useState<{success?: boolean; message?: string}>({});

  useEffect(() => {
    // Update subscription statuses on component mount
    subscriptionManager.updateSubscriptionStatuses();
    loadData();
  }, []);

  const loadData = () => {
    if (user) {
      // Get learners associated with this parent
      const parentLearners = learnerStore.getAll().filter(learner => learner.parentUserId === user.userId);
      setLearners(parentLearners);

      // Get subscriptions for these learners
      const learnerSubscriptions = subscriptionStore.getAll().filter(sub => 
        parentLearners.some(learner => learner.learnerId === sub.learnerId)
      );
      setSubscriptions(learnerSubscriptions);

      // Calculate available credits from active (unredeemed) vouchers for this parent
      const redeemedVouchers = voucherStore.getAll().filter(v => v.redeemedBy === user.userId && !v.isRedeemed);
      const totalCredits = redeemedVouchers.reduce((sum, v) => sum + v.credits, 0);
      setAvailableCredits(totalCredits);

      setLoading(false);
    }
  };

  const handleRedeemVoucher = () => {
    if (!voucherCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a voucher code",
        variant: "destructive"
      });
      return;
    }

    if (user) {
      const result = subscriptionManager.redeemVoucher(voucherCode, user.userId);
      
      if (result.success) {
        // Update available credits
        setAvailableCredits(prev => prev + (result.credits || 0));
        
        toast({
          title: "Success",
          description: result.message,
        });

        // Reset voucher input
        setVoucherCode('');
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }

      setRedeemStatus(result);
    }
  };

  const handleSubscribe = (learnerId: string) => {
    if (user && availableCredits >= 1) {
      const result = subscriptionManager.subscribeLearner(learnerId, user.userId, 1);
      
      if (result.success) {
        // Deduct credit
        setAvailableCredits(prev => prev - 1);
        
        // Refresh data
        loadData();
        
        toast({
          title: "Subscription Activated",
          description: result.message,
        });
      } else {
        toast({
          title: "Subscription Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to activate a subscription. Please purchase or redeem more credits.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLearnerSubscription = (learnerId: string): Subscription | undefined => {
    return subscriptions.find(sub => sub.learnerId === learnerId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 border rounded-lg p-5">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Subscription Credits
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Purchase or redeem vouchers to access parent portal features</p>
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-lg text-center min-w-[120px]">
            <p className="text-sm font-medium mb-1">Available Credits</p>
            <p className="text-3xl font-bold text-primary">{availableCredits}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Redeem Voucher</h4>
          <div className="flex gap-2">
            <Input 
              placeholder="Enter voucher code (e.g., ABC12345)" 
              value={voucherCode} 
              onChange={e => setVoucherCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="uppercase"
            />
            <Button onClick={handleRedeemVoucher}>
              <KeyIcon className="h-4 w-4 mr-2" />
              Redeem
            </Button>
          </div>
          
          {redeemStatus.message && (
            <Alert className={`mt-3 ${redeemStatus.success ? 'bg-green-50 text-green-800 border-green-300' : 'bg-red-50 text-red-800 border-red-300'}`}>
              <AlertTitle className="flex items-center gap-1">
                {redeemStatus.success ? (
                  <CheckCircleIcon className="h-4 w-4" />
                ) : (
                  <XCircleIcon className="h-4 w-4" />
                )}
                {redeemStatus.success ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription>{redeemStatus.message}</AlertDescription>
            </Alert>
          )}
          
          <div className="mt-4 bg-blue-50 text-blue-800 p-3 rounded text-sm">
            <p className="font-medium">How to get vouchers:</p>
            <p>Contact the school administrator to purchase subscription vouchers at R5 per learner for 30 days of access.</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">My Learners</h3>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <RefreshCwIcon className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : learners.length === 0 ? (
          <div className="text-center p-8 bg-muted/20 rounded-lg">
            <p>No learners found linked to your account.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {learners.map(learner => {
              const subscription = getLearnerSubscription(learner.learnerId);
              const isSubscribed = subscription?.status === 'Active';
              const isExpired = subscription?.status === 'Expired';
              
              return (
                <Card key={learner.learnerId} className={`${isSubscribed ? 'border-green-300' : isExpired ? 'border-amber-300' : 'border-gray-200'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{learnerStore.getById(learner.userId)?.fullName || 'Unknown Learner'}</CardTitle>
                    <CardDescription>Grade {learner.grade}{learner.class}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        {isSubscribed ? (
                          <span className="font-medium text-green-600 flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Active
                          </span>
                        ) : isExpired ? (
                          <span className="font-medium text-amber-600">Expired</span>
                        ) : (
                          <span className="font-medium text-red-600">Not Subscribed</span>
                        )}
                      </div>
                      
                      {(isSubscribed || isExpired) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expires:</span>
                          <span className="font-medium flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formatDate(subscription?.endDate)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-medium">R5 for 30 days</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleSubscribe(learner.learnerId)} 
                      className="w-full" 
                      variant={isSubscribed ? "outline" : "default"}
                      disabled={availableCredits < 1}
                    >
                      {isSubscribed ? 'Extend Subscription' : 'Activate Subscription'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
        
        {learners.length > 0 && availableCredits < 1 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded text-sm">
            <p className="font-medium">You need more credits</p>
            <p>You have 0 available credits. Redeem a voucher to activate or extend subscriptions.</p>
          </div>
        )}
      </div>
    </div>
  );
}