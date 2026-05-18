import { Navigate, Route, Routes } from 'react-router-dom'
import AuthGuard from './components/AuthGuard'
import AppLayout from './layouts/AppLayout'
import CustomersPage from './pages/CustomersPage'
import DashboardPage from './pages/DashboardPage'
import ExpensesPage from './pages/ExpensesPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import CreateInvoicePage from './pages/CreateInvoicePage'
import CreateQuotationPage from './pages/CreateQuotationPage'
import CustomerEditPage from './pages/CustomerEditPage'
import ExpenseEditPage from './pages/ExpenseEditPage'
import InvoiceEditorPage from './pages/InvoiceEditorPage'
import InvoicesPage from './pages/InvoicesPage'
import LoginPage from './pages/LoginPage'
import PaymentEditPage from './pages/PaymentEditPage'
import PaymentsPage from './pages/PaymentsPage'
import ProductsPage from './pages/ProductsPage'
import PurchaseDetailPage from './pages/PurchaseDetailPage'
import PurchasesPage from './pages/PurchasesPage'
import QuotationsPage from './pages/QuotationsPage'
import RegisterPage from './pages/RegisterPage'
import InvoicePdfPreviewPage from './pages/InvoicePdfPreviewPage'
import SuppliersPage from './pages/SuppliersPage'
import CompanySettingsPage from './pages/settings/CompanySettingsPage'
import EmailSettingsPage from './pages/settings/EmailSettingsPage'
import InvoiceTemplatePage from './pages/settings/InvoiceTemplatePage'
import SettingsPage from './pages/SettingsPage'
import TaxSettingsPage from './pages/settings/TaxSettingsPage'
import UsersPage from './pages/UsersPage'
import { useAuth } from './hooks/useAuth'

function App() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        path="/"
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id/edit" element={<CustomerEditPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/create" element={<CreateInvoicePage />} />
        <Route path="invoices/:id/edit" element={<InvoiceEditorPage mode="invoice" />} />
        <Route path="invoices/:id/preview" element={<InvoicePdfPreviewPage />} />
        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="quotations/create" element={<CreateQuotationPage />} />
        <Route path="quotations/:id/edit" element={<InvoiceEditorPage mode="quotation" />} />
        <Route path="quotations/:id/preview" element={<InvoicePdfPreviewPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="purchases/:id" element={<PurchaseDetailPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="payments/:id/edit" element={<PaymentEditPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="expenses/:id/edit" element={<ExpenseEditPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/company" element={<CompanySettingsPage />} />
        <Route path="settings/tax" element={<TaxSettingsPage />} />
        <Route path="settings/email" element={<EmailSettingsPage />} />
        <Route path="settings/invoice-template" element={<InvoiceTemplatePage />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={token ? '/dashboard' : '/login'} replace />
        }
      />
    </Routes>
  )
}

export default App
