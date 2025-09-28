import React, { useState } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import {
  Search,
  Plus,
  X,
  Settings,
  MoreHorizontal,
  Clock
} from "lucide-react";

/* ---------------------- REDUX SLICE ---------------------- */
// All available widgets (master list)
const allWidgets = {
  cspm: {
    "cloud-accounts": {
      id: "cloud-accounts",
      name: "Cloud Accounts",
      text: "Overview of cloud account connections and status",
      data: {
        connected: 2,
        notConnected: 2,
        total: 4,
        connectedLabel: "Connected (2)",
        notConnectedLabel: "Not Connected (2)"
      }
    },
    "cloud-risk-assessment": {
      id: "cloud-risk-assessment",
      name: "Cloud Account Risk Assessment",
      text: "Security risk analysis across cloud infrastructure",
      data: {
        failed: 1689,
        warning: 681,
        notAvailable: 36,
        passed: 7253,
        total: 9659,
        failedLabel: "Failed (1689)",
        warningLabel: "Warning (681)",
        notAvailableLabel: "Not available (36)",
        passedLabel: "Passed (7253)"
      }
    }
  },
  cwpp: {
    "namespace-alerts": {
      id: "namespace-alerts",
      name: "Top 5 Namespace Specific Alerts",
      text: "Critical namespace security alerts and monitoring",
      data: { message: "No Graph data available!" }
    },
    "workload-alerts": {
      id: "workload-alerts",
      name: "Workload Alerts",
      text: "Real-time workload security monitoring and alerts",
      data: { message: "No Graph data available!" }
    }
  },
  registry: {
    "image-risk-assessment": {
      id: "image-risk-assessment",
      name: "Image Risk Assessment",
      text: "Container image vulnerability assessment",
      data: {
        critical: 9,
        high: 150,
        medium: 320,
        low: 991,
        total: 1470,
        totalLabel: "1470 Total Vulnerabilities"
      }
    },
    "image-security-issues": {
      id: "image-security-issues",
      name: "Image Security Issues",
      text: "Critical security vulnerabilities in images",
      data: {
        critical: 2,
        high: 2,
        medium: 0,
        low: 0,
        total: 4,
        totalLabel: "4 Total Images"
      }
    }
  }
};

const initialState = {
  categories: {
    cspm: {
      id: "cspm",
      name: "CSPM Executive Dashboard",
      widgets: { ...allWidgets.cspm } // Start with all widgets visible
    },
    cwpp: {
      id: "cwpp",
      name: "CWPP Dashboard",
      widgets: { ...allWidgets.cwpp }
    },
    registry: {
      id: "registry",
      name: "Registry Scan",
      widgets: { ...allWidgets.registry }
    }
  }
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    addWidget: (state, action) => {
      const { categoryId, widget } = action.payload;
      state.categories[categoryId].widgets[widget.id] = widget;
    },
    removeWidget: (state, action) => {
      const { categoryId, widgetId } = action.payload;
      delete state.categories[categoryId].widgets[widgetId];
    },
    toggleWidget: (state, action) => {
      const { categoryId, widgetId, widget } = action.payload;
      if (state.categories[categoryId].widgets[widgetId]) {
        delete state.categories[categoryId].widgets[widgetId];
      } else {
        state.categories[categoryId].widgets[widgetId] = widget;
      }
    },
    resetDashboard: () => initialState
  }
});

const { removeWidget, resetDashboard, toggleWidget } = dashboardSlice.actions;

const store = configureStore({
  reducer: {
    dashboard: dashboardSlice.reducer
  }
});

/* ---------------------- WIDGET COMPONENT ---------------------- */
const Widget = ({ widget, categoryId, onRemove }) => {
  const renderWidgetContent = () => {
    if (widget.data?.message) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 mb-4 opacity-20">
            <svg viewBox="0 0 64 64" className="w-full h-full text-gray-400">
              <rect x="8" y="16" width="48" height="2" fill="currentColor" />
              <rect x="8" y="24" width="32" height="2" fill="currentColor" />
              <rect x="8" y="32" width="40" height="2" fill="currentColor" />
              <rect x="8" y="40" width="24" height="2" fill="currentColor" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">{widget.data.message}</p>
        </div>
      );
    }

    // Cloud Accounts - Donut Chart
    if (widget.id === "cloud-accounts") {
      const { connected, notConnected, total } = widget.data;
      const connectedPercentage = (connected / total) * 100;
      const radius = 60;
      const circumference = 2 * Math.PI * radius;
      const strokeDasharray = `${(connectedPercentage / 100) * circumference} ${circumference}`;

      return (
        <div className="flex items-center justify-between py-4">
          <div className="relative">
            <svg width="140" height="140" className="transform -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth="20"
                fill="none"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#3b82f6"
                strokeWidth="20"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{total}</span>
              <span className="text-sm text-gray-500">Total</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Connected ({connected})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-sm text-gray-600">Not Connected ({notConnected})</span>
            </div>
          </div>
        </div>
      );
    }

    // Cloud Risk Assessment - Donut Chart
    if (widget.id === "cloud-risk-assessment") {
      const { failed, warning, notAvailable, passed, total } = widget.data;
      const radius = 60;
      const circumference = 2 * Math.PI * radius;
      
      const failedPercentage = (failed / total) * 100;
      const warningPercentage = (warning / total) * 100;
      const notAvailablePercentage = (notAvailable / total) * 100;
      const passedPercentage = (passed / total) * 100;

      return (
        <div className="flex items-center justify-between py-4">
          <div className="relative">
            <svg width="140" height="140" className="transform -rotate-90">
              <circle cx="70" cy="70" r={radius} stroke="#e5e7eb" strokeWidth="20" fill="none" />
              <circle
                cx="70" cy="70" r={radius} stroke="#dc2626" strokeWidth="20" fill="none"
                strokeDasharray={`${(failedPercentage / 100) * circumference} ${circumference}`}
                strokeLinecap="round"
              />
              <circle
                cx="70" cy="70" r={radius} stroke="#f59e0b" strokeWidth="20" fill="none"
                strokeDasharray={`${(warningPercentage / 100) * circumference} ${circumference}`}
                strokeDashoffset={`-${(failedPercentage / 100) * circumference}`}
                strokeLinecap="round"
              />
              <circle
                cx="70" cy="70" r={radius} stroke="#6b7280" strokeWidth="20" fill="none"
                strokeDasharray={`${(notAvailablePercentage / 100) * circumference} ${circumference}`}
                strokeDashoffset={`-${((failedPercentage + warningPercentage) / 100) * circumference}`}
                strokeLinecap="round"
              />
              <circle
                cx="70" cy="70" r={radius} stroke="#16a34a" strokeWidth="20" fill="none"
                strokeDasharray={`${(passedPercentage / 100) * circumference} ${circumference}`}
                strokeDashoffset={`-${((failedPercentage + warningPercentage + notAvailablePercentage) / 100) * circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{total}</span>
              <span className="text-sm text-gray-500">Total</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span className="text-sm text-gray-600">Failed ({failed})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Warning ({warning})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-sm text-gray-600">Not available ({notAvailable})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-sm text-gray-600">Passed ({passed})</span>
            </div>
          </div>
        </div>
      );
    }

    // Image Risk Assessment - Horizontal Bar Chart
    if (widget.id === "image-risk-assessment") {
      const { critical, high, medium, low, total, totalLabel } = widget.data;
      const criticalWidth = (critical / total) * 100;
      const highWidth = (high / total) * 100;
      const mediumWidth = (medium / total) * 100;
      const lowWidth = (low / total) * 100;

      return (
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{total}</span>
            <span className="text-sm text-gray-500">{totalLabel}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
            <div className="bg-red-700 h-full" style={{ width: `${criticalWidth}%` }}></div>
            <div className="bg-red-500 h-full" style={{ width: `${highWidth}%` }}></div>
            <div className="bg-orange-400 h-full" style={{ width: `${mediumWidth}%` }}></div>
            <div className="bg-yellow-400 h-full" style={{ width: `${lowWidth}%` }}></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-700"></div>
              <span>Critical ({critical})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span>High ({high})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-400"></div>
              <span>Medium ({medium})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-400"></div>
              <span>Low ({low})</span>
            </div>
          </div>
        </div>
      );
    }

    // Image Security Issues - Horizontal Bar Chart
    if (widget.id === "image-security-issues") {
      const { critical, high, medium, low, total, totalLabel } = widget.data;
      const criticalWidth = total > 0 ? (critical / total) * 100 : 0;
      const highWidth = total > 0 ? (high / total) * 100 : 0;
      const mediumWidth = total > 0 ? (medium / total) * 100 : 0;
      const lowWidth = total > 0 ? (low / total) * 100 : 0;

      return (
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{total}</span>
            <span className="text-sm text-gray-500">{totalLabel}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
            <div className="bg-red-700 h-full" style={{ width: `${criticalWidth}%` }}></div>
            <div className="bg-red-500 h-full" style={{ width: `${highWidth}%` }}></div>
            <div className="bg-orange-400 h-full" style={{ width: `${mediumWidth}%` }}></div>
            <div className="bg-yellow-400 h-full" style={{ width: `${lowWidth}%` }}></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-700"></div>
              <span>Critical ({critical})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span>High ({high})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-400"></div>
              <span>Medium ({medium})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-400"></div>
              <span>Low ({low})</span>
            </div>
          </div>
        </div>
      );
    }

    // fallback
    return (
      <div className="py-8 flex items-center justify-center text-gray-500">
        <p className="text-sm">Widget content</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative group">
      <button
        onClick={() => onRemove(categoryId, widget.id)}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
      >
        <X size={12} />
      </button>
      <h3 className="font-medium text-gray-800 mb-2 pr-8">{widget.name}</h3>
      {renderWidgetContent()}
    </div>
  );
};

/* ---------------------- ADD WIDGET PANEL ---------------------- */
const AddWidgetPanel = ({ isOpen, onClose }) => {
  const categories = useSelector((state) => state.dashboard.categories);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("cspm");

  const handleToggleWidget = (categoryId, widgetId) => {
    const widget = allWidgets[categoryId][widgetId];
    dispatch(toggleWidget({ categoryId, widgetId, widget }));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={onClose}
        ></div>
      )}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-blue-600 text-white">
          <h2 className="text-lg font-medium">Add Widget</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">Personalise your dashboard by adding the following widget</p>
          <div className="flex border-b border-gray-200 mb-6">
            {["cspm", "cwpp", "registry"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-4 mb-20 max-h-96 overflow-y-auto">
            {Object.values(allWidgets[activeTab]).map((widget) => {
              const isChecked = !!categories[activeTab].widgets[widget.id];
              return (
                <div className="flex items-center gap-3" key={widget.id}>
                  <input
                    type="checkbox"
                    id={widget.id}
                    checked={isChecked}
                    onChange={() => handleToggleWidget(activeTab, widget.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={widget.id} className="text-sm text-gray-700 cursor-pointer">
                    {widget.name}
                  </label>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-4 right-4 left-4 flex justify-end gap-3 bg-white pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ---------------------- MAIN DASHBOARD ---------------------- */
const DashboardContent = () => {
  const categories = useSelector((state) => state.dashboard.categories);
  const dispatch = useDispatch();
  const [isAddWidgetPanelOpen, setIsAddWidgetPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleRemoveWidget = (categoryId, widgetId) => {
    dispatch(removeWidget({ categoryId, widgetId }));
  };

  const handleResetDashboard = () => {
    if (window.confirm("Reset dashboard to default?")) {
      dispatch(resetDashboard());
    }
  };

  const filteredCategories = () => {
    if (!searchTerm.trim()) return categories;
    const filtered = {};
    Object.entries(categories).forEach(([catId, category]) => {
      const filteredWidgets = {};
      Object.entries(category.widgets).forEach(([widgetId, widget]) => {
        if (
          widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (widget.text &&
            widget.text.toLowerCase().includes(searchTerm.toLowerCase()))
        ) {
          filteredWidgets[widgetId] = widget;
        }
      });
      if (Object.keys(filteredWidgets).length > 0) {
        filtered[catId] = { ...category, widgets: filteredWidgets };
      }
    });
    return filtered;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Home</span>
              <span className="text-sm text-gray-400">›</span>
              <span className="text-sm font-medium text-gray-900">
                Dashboard V2
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setIsAddWidgetPanelOpen(true)}
                className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <Plus size={16} />
                Add Widget
              </button>
              <button
                onClick={handleResetDashboard}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Settings size={18} />
              </button>
              <MoreHorizontal size={18} className="text-gray-400" />
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white text-sm">
                <Clock size={16} className="text-gray-400" />
                <span>Last 2 days</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Widgets Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-8">
          {Object.keys(filteredCategories()).length > 0 ? (
            Object.entries(filteredCategories()).map(
              ([categoryId, category]) => (
                <div key={categoryId}>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    {category.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(category.widgets).map((widget) => (
                      <Widget
                        key={widget.id}
                        widget={widget}
                        categoryId={categoryId}
                        onRemove={handleRemoveWidget}
                      />
                    ))}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">
                No widgets match your search criteria.
              </p>
            </div>
          )}
        </div>

        <AddWidgetPanel
          isOpen={isAddWidgetPanelOpen}
          onClose={() => setIsAddWidgetPanelOpen(false)}
        />
      </div>
    </div>
  );
};

/* ---------------------- EXPORT ---------------------- */
const Dashboard = () => (
  <Provider store={store}>
    <DashboardContent />
  </Provider>
);

export default Dashboard;
