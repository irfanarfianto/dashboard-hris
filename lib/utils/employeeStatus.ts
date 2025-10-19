/**
 * Employee Status Utilities
 *
 * Helper functions to derive employee status from contracts.
 * Status is no longer stored in employees table but computed from:
 * - employee_contracts.contract_type (active contract)
 * - employees.termination_date (if resigned/fired)
 */

export type EmployeeStatus = "PROBATION" | "ACTIVE" | "INACTIVE" | "TERMINATED";
export type ContractType = "Probation" | "Contract" | "Permanent";

export interface EmployeeContract {
  id: number;
  employee_id: number;
  contract_type: ContractType;
  start_date: string;
  end_date: string | null;
  salary_base: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Get employee status from contract type
 *
 * @param contractType - The type of the active contract
 * @returns EmployeeStatus
 */
export function getStatusFromContractType(
  contractType: ContractType
): EmployeeStatus {
  switch (contractType) {
    case "Probation":
      return "PROBATION";
    case "Contract":
    case "Permanent":
      return "ACTIVE";
    default:
      return "INACTIVE";
  }
}

/**
 * Get employee status from contracts array
 *
 * Finds the active contract and derives status from it.
 * Active contract = not deleted AND (no end_date OR end_date >= today)
 *
 * @param contracts - Array of employee contracts
 * @param terminationDate - Optional termination date
 * @returns EmployeeStatus
 */
export function getEmployeeStatus(
  contracts: EmployeeContract[],
  terminationDate?: string | null
): EmployeeStatus {
  // If employee has termination date, status is TERMINATED
  if (terminationDate) {
    return "TERMINATED";
  }

  // Find active contract
  const today = new Date().toISOString().split("T")[0];
  const activeContract = contracts.find(
    (c) => !c.deleted_at && (!c.end_date || c.end_date >= today)
  );

  // No active contract = INACTIVE
  if (!activeContract) {
    return "INACTIVE";
  }

  // Return status based on contract type
  return getStatusFromContractType(activeContract.contract_type);
}

/**
 * Get active contract from contracts array
 *
 * @param contracts - Array of employee contracts
 * @returns Active contract or null
 */
export function getActiveContract(
  contracts: EmployeeContract[]
): EmployeeContract | null {
  const today = new Date().toISOString().split("T")[0];
  const activeContract = contracts.find(
    (c) => !c.deleted_at && (!c.end_date || c.end_date >= today)
  );

  return activeContract || null;
}

/**
 * Get status badge color classes for UI
 *
 * @param status - Employee status
 * @returns Tailwind CSS classes for badge
 */
export function getStatusBadgeClasses(status: EmployeeStatus): string {
  switch (status) {
    case "PROBATION":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    case "TERMINATED":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
  }
}

/**
 * Get status label in Indonesian
 *
 * @param status - Employee status
 * @returns Indonesian label
 */
export function getStatusLabel(status: EmployeeStatus): string {
  switch (status) {
    case "PROBATION":
      return "Masa Percobaan";
    case "ACTIVE":
      return "Aktif";
    case "INACTIVE":
      return "Tidak Aktif";
    case "TERMINATED":
      return "Berhenti";
    default:
      return "Unknown";
  }
}

/**
 * Check if contract is expiring soon (within 30 days)
 *
 * @param contract - Employee contract
 * @returns true if expiring within 30 days
 */
export function isContractExpiringSoon(contract: EmployeeContract): boolean {
  if (!contract.end_date || contract.deleted_at) return false;

  const today = new Date();
  const endDate = new Date(contract.end_date);
  const daysUntilExpiry = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
}

/**
 * Get contract type label in Indonesian
 *
 * @param contractType - Contract type
 * @returns Indonesian label
 */
export function getContractTypeLabel(contractType: ContractType): string {
  switch (contractType) {
    case "Probation":
      return "Masa Percobaan";
    case "Contract":
      return "Kontrak";
    case "Permanent":
      return "Tetap";
    default:
      return "Unknown";
  }
}
