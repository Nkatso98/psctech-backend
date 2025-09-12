import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, CreditCard, UserCheck, Users, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface VoucherRedemptionProps {
  institutionId?: string;
  institutionName?: string;
}

interface VoucherRedemptionResult {
  success: boolean;
  voucherCode: string;
  value: number;
  learnerCount: number;
  parentName: string;
  expiryDate: string;
  message: string;
  redeemedAt: string;
  activatedLearners: string[];
}

export function VoucherRedemption({ institutionId, institutionName }: VoucherRedemptionProps) {
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState<VoucherRedemptionResult | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<VoucherRedemptionResult[]>([]);

  const redeemVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Please enter a voucher code');
      return;
    }

    // Validate voucher code format (XXXX-XXXX-XXXX-XXXX)
    const codeRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!codeRegex.test(voucherCode.trim().toUpperCase())) {
      toast.error('Invalid voucher code format. Expected: XXXX-XXXX-XXXX-XXXX');
      return;
    }

    setIsRedeeming(true);
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation - replace with actual API validation
      const isValidVoucher = Math.random() > 0.1; // 90% success rate for demo
      
      if (isValidVoucher) {
        // Extract value from voucher code (demo logic)
        const value = Math.floor(Math.random() * 40) + 5; // Random value between R5-R45
        const learnerCount = Math.floor(Math.random() * 3) + 1; // Random learner count 1-3
        
        // Mock learner names
        const learnerNames = ['John Doe', 'Jane Doe', 'Mike Doe'].slice(0, learnerCount);
        
        const result: VoucherRedemptionResult = {
          success: true,
          voucherCode: voucherCode.trim().toUpperCase(),
          value,
          learnerCount,
          parentName: 'Parent Name',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          message: `Voucher redeemed successfully! Dashboard access activated for ${learnerCount} learner${learnerCount !== 1 ? 's' : ''}.`,
          redeemedAt: new Date().toISOString(),
          activatedLearners: learnerNames
        };
        
        setRedemptionResult(result);
        setRecentRedemptions(prev => [result, ...prev.slice(0, 4)]); // Keep last 5
        toast.success(`R${value} voucher redeemed for ${learnerCount} learner${learnerCount !== 1 ? 's' : ''}!`);
        
        // Reset form
        setVoucherCode('');
      } else {
        const result: VoucherRedemptionResult = {
          success: false,
          voucherCode: voucherCode.trim().toUpperCase(),
          value: 0,
          learnerCount: 0,
          parentName: '',
          expiryDate: '',
          message: 'Invalid or expired voucher code. Please check and try again.',
          redeemedAt: new Date().toISOString(),
          activatedLearners: []
        };
        
        setRedemptionResult(result);
        toast.error('Voucher redemption failed');
      }
    } catch (error) {
      toast.error('Failed to redeem voucher. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const formatVoucherCode = (code: string) => {
    return code.replace(/(.{4})/g, '$1-').slice(0, -1);
  };

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Auto-format as XXXX-XXXX-XXXX-XXXX
    if (value.length > 16) value = value.slice(0, 16);
    
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += '-';
      formatted += value[i];
    }
    
    setVoucherCode(formatted);
  };

  const clearResult = () => {
    setRedemptionResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Voucher Redemption Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Redeem Voucher
          </CardTitle>
          {institutionName && (
            <div className="text-sm text-gray-600">
              Institution: <Badge variant="outline">{institutionName}</Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voucher-code">Voucher Code</Label>
            <div className="flex items-center gap-2">
              <Input
                id="voucher-code"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={voucherCode}
                onChange={handleCodeInput}
                className="font-mono text-lg"
                maxLength={19} // 16 chars + 3 hyphens
              />
              <Button 
                onClick={redeemVoucher} 
                disabled={isRedeeming || !voucherCode.trim()}
                className="min-w-[120px]"
              >
                {isRedeeming ? 'Redeeming...' : 'Redeem'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Enter the 16-character voucher code from your voucher slip
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Redemption Result */}
      {redemptionResult && (
        <Card className={`border-2 ${
          redemptionResult.success 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              redemptionResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {redemptionResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              {redemptionResult.success ? 'Voucher Redeemed!' : 'Redemption Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Voucher Code</Label>
                <div className="font-mono text-lg font-bold bg-white p-2 rounded border">
                  {formatVoucherCode(redemptionResult.voucherCode)}
                </div>
              </div>
              
              {redemptionResult.success && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Value</Label>
                  <div className="text-2xl font-bold text-green-600">
                    R{redemptionResult.value}
                  </div>
                </div>
              )}
            </div>

            {redemptionResult.success && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Learners Activated</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {redemptionResult.learnerCount} learner{redemptionResult.learnerCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-gray-700">
                      {new Date(redemptionResult.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Message</Label>
              <div className={`p-3 rounded-lg ${
                redemptionResult.success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {redemptionResult.message}
              </div>
            </div>

            {redemptionResult.success && redemptionResult.activatedLearners.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Activated Learners</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {redemptionResult.activatedLearners.map((learner, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">{learner}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {redemptionResult.success && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Redeemed At</Label>
                  <div className="text-sm text-gray-700">
                    {new Date(redemptionResult.redeemedAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Access Duration</Label>
                  <div className="text-sm text-gray-700">
                    30 days from redemption
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button onClick={clearResult} variant="outline" className="flex-1">
                Redeem Another
              </Button>
              {redemptionResult.success && (
                <Button 
                  onClick={() => window.location.href = '/dashboard'} 
                  className="flex-1"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Redemptions */}
      {recentRedemptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Redemptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRedemptions.map((redemption, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    redemption.success 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {redemption.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <div className="font-mono text-sm font-medium">
                        {formatVoucherCode(redemption.voucherCode)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(redemption.redeemedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {redemption.success && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-green-700">
                        R{redemption.value}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {redemption.learnerCount} learner{redemption.learnerCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <AlertCircle className="h-5 w-5" />
            How Vouchers Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-800">
          <div className="space-y-2">
            <p className="font-medium">1. Get a Voucher</p>
            <p className="text-blue-700">
              Purchase a voucher from your school's administration office. 
              Vouchers come in denominations from R5 to R45 and can activate multiple learners.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">2. Redeem Online</p>
            <p className="text-blue-700">
              Enter the voucher code on this page to activate dashboard access 
              for all learners associated with the voucher.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">3. Access Dashboard</p>
            <p className="text-blue-700">
              Once redeemed, you'll have full access to view grades, attendance, 
              assignments, and communicate with teachers for all activated learners.
            </p>
          </div>
          
          <div className="pt-2 border-t border-blue-200">
            <p className="text-xs">
              <strong>Note:</strong> Vouchers are valid for 30 days after redemption. 
              Lost or stolen vouchers cannot be replaced. Each voucher can only be used once.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
