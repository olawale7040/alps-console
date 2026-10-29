export const LIST_DEVICES = `
  query ListDevices(
    $tenantId: String
    $imei: String
    $serialNumber: String
    $stateId: Int
    $page: Int
    $pageSize: Int
  ) {
    listDevices(
      tenantId: $tenantId
      imei: $imei
      serialNumber: $serialNumber
      stateId: $stateId
      page: $page
      pageSize: $pageSize
    ) {
      pageInfo {
        total_count
      }
      deviceList {
        id
        serialNumber
        modelMarketingName
        brandName
        IMEIs {
          imei
          isPrimary
        }
        state {
          id
          name
        }
        policy {
          id
          name
          color
        }
        lastCheckin
      }
    }
  }
`
