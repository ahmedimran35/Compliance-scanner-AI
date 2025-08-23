import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import LoadingScreen from './LoadingScreen';

// This component demonstrates all available loading animations
// You can use this as a reference for implementing loading states throughout your app

export const LoadingExamples: React.FC = () => {
  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold text-center mb-8">Loading Animation Examples</h1>
      
      {/* Loading Spinner Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Loading Spinner Variants</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="default" size="lg" />
            <p className="mt-2 text-sm">Default</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="pulse" size="lg" />
            <p className="mt-2 text-sm">Pulse</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="dots" size="lg" />
            <p className="mt-2 text-sm">Dots</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="bars" size="lg" />
            <p className="mt-2 text-sm">Bars</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="ripple" size="lg" />
            <p className="mt-2 text-sm">Ripple</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="orbit" size="lg" />
            <p className="mt-2 text-sm">Orbit</p>
          </div>
        </div>
      </section>

      {/* Loading Spinner Colors */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Loading Spinner Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="default" color="primary" size="lg" />
            <p className="mt-2 text-sm">Primary</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="default" color="blue" size="lg" />
            <p className="mt-2 text-sm">Blue</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="default" color="purple" size="lg" />
            <p className="mt-2 text-sm">Purple</p>
          </div>
          <div className="text-center p-4 bg-gray-900 rounded-lg shadow">
            <LoadingSpinner variant="default" color="white" size="lg" />
            <p className="mt-2 text-sm text-white">White</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="default" color="gradient" size="lg" />
            <p className="mt-2 text-sm">Gradient</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="default" color="secondary" size="lg" />
            <p className="mt-2 text-sm">Secondary</p>
          </div>
        </div>
      </section>

      {/* Loading Spinner Sizes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Loading Spinner Sizes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="default" size="sm" />
            <p className="mt-2 text-sm">Small</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="default" size="md" />
            <p className="mt-2 text-sm">Medium</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="default" size="lg" />
            <p className="mt-2 text-sm">Large</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <LoadingSpinner variant="default" size="xl" />
            <p className="mt-2 text-sm">Extra Large</p>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Usage Examples</h2>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Simple Loading with Text</h3>
            <LoadingSpinner variant="dots" color="primary" text="Loading data..." />
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Fancy Loading</h3>
            <LoadingSpinner variant="orbit" color="gradient" text="Processing..." />
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Tech Style Loading</h3>
            <LoadingSpinner variant="bars" color="blue" text="Initializing..." />
          </div>
        </div>
      </section>
    </div>
  );
};

// Example usage in your components:
export const ExampleUsage = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <LoadingScreen 
        variant="fancy" 
        theme="dark" 
        message="Loading your dashboard..." 
      />
    );
  }

  return (
    <div className="p-8">
      <h1>Your Content Here</h1>
      <p>This content loads after the loading screen</p>
    </div>
  );
};

export default LoadingExamples; 