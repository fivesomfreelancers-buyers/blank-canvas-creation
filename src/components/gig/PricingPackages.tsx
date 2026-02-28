
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, DollarSign, Clock, RefreshCw, Plus, X } from 'lucide-react';
import { GigData, PackageData } from '../../pages/CreateGig';

interface PricingPackagesProps {
  gigData: GigData;
  updateGigData: (data: Partial<GigData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const PricingPackages = ({ gigData, updateGigData, onNext, onPrevious }: PricingPackagesProps) => {
  const deliveryOptions = ['1 day', '2 days', '3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '30 days'];
  const revisionOptions = ['0', '1', '2', '3', '5', 'Unlimited'];

  const updatePackage = (packageType: keyof typeof gigData.packages, updates: Partial<PackageData>) => {
    const updatedPackages = {
      ...gigData.packages,
      [packageType]: { ...gigData.packages[packageType], ...updates }
    };
    updateGigData({ packages: updatedPackages });
  };

  const togglePackage = (packageType: keyof typeof gigData.packages) => {
    updatePackage(packageType, { isActive: !gigData.packages[packageType].isActive });
  };

  const addFeature = (packageType: keyof typeof gigData.packages, feature: string) => {
    if (feature.trim() && gigData.packages[packageType].features.length < 10) {
      const newFeatures = [...gigData.packages[packageType].features, feature.trim()];
      updatePackage(packageType, { features: newFeatures });
    }
  };

  const removeFeature = (packageType: keyof typeof gigData.packages, featureIndex: number) => {
    const newFeatures = gigData.packages[packageType].features.filter((_, index) => index !== featureIndex);
    updatePackage(packageType, { features: newFeatures });
  };

  const handleNext = () => {
    const activePackages = Object.values(gigData.packages).filter(pkg => pkg.isActive);
    const isValid = activePackages.length > 0 && activePackages.every(pkg => 
      pkg.price && pkg.deliveryTime && pkg.revisions && pkg.features.length > 0
    );
    
    if (isValid) {
      onNext();
    }
  };

  const PackageCard = ({ packageType, pkg, title }: { 
    packageType: keyof typeof gigData.packages; 
    pkg: PackageData; 
    title: string;
  }) => {
    const [newFeature, setNewFeature] = React.useState('');

    return (
      <div className={`border-2 rounded-lg p-6 transition-all ${
        pkg.isActive ? 'border-cyan-500 bg-cyan-50/50' : 'border-gray-200 bg-gray-50/50'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Button
            variant={pkg.isActive ? "default" : "outline"}
            size="sm"
            onClick={() => togglePackage(packageType)}
          >
            {pkg.isActive ? 'Active' : 'Activate'}
          </Button>
        </div>

        {pkg.isActive && (
          <div className="space-y-4">
            {/* Package Name */}
            <div>
              <Label className="text-sm font-medium">Package Name</Label>
              <Input
                value={pkg.name}
                onChange={(e) => updatePackage(packageType, { name: e.target.value })}
                placeholder={title}
                className="mt-1"
              />
            </div>

            {/* Price and Delivery Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Price (USD) *</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    min="5"
                    value={pkg.price}
                    onChange={(e) => updatePackage(packageType, { price: e.target.value })}
                    className="pl-9"
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Delivery Time *</Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={pkg.deliveryTime}
                    onChange={(e) => updatePackage(packageType, { deliveryTime: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    {deliveryOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Revisions */}
            <div>
              <Label className="text-sm font-medium">Revisions *</Label>
              <div className="relative mt-1">
                <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={pkg.revisions}
                  onChange={(e) => updatePackage(packageType, { revisions: e.target.value })}
                  className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  {revisionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Features */}
            <div>
              <Label className="text-sm font-medium">What's Included *</Label>
              <div className="mt-2 space-y-2">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex-1 justify-between">
                      <span>{feature}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-500 ml-2" 
                        onClick={() => removeFeature(packageType, index)}
                      />
                    </Badge>
                  </div>
                ))}
                
                {pkg.features.length < 10 && (
                  <div className="flex space-x-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addFeature(packageType, newFeature);
                          setNewFeature('');
                        }
                      }}
                      placeholder="e.g., Source file included"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        addFeature(packageType, newFeature);
                        setNewFeature('');
                      }}
                      disabled={!newFeature.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const activePackages = Object.values(gigData.packages).filter(pkg => pkg.isActive);
  const isValid = activePackages.length > 0 && activePackages.every(pkg => 
    pkg.price && pkg.deliveryTime && pkg.revisions && pkg.features.length > 0
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Pricing Packages</h2>
        <p className="text-gray-600">Set up your service packages and pricing (activate at least one package)</p>
      </div>

      <div className="grid gap-6">
        <PackageCard packageType="basic" pkg={gigData.packages.basic} title="Basic Package" />
        <PackageCard packageType="standard" pkg={gigData.packages.standard} title="Standard Package" />
        <PackageCard packageType="premium" pkg={gigData.packages.premium} title="Premium Package" />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button onClick={onPrevious} variant="outline" className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600"
        >
          <span>Next: Description</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PricingPackages;
