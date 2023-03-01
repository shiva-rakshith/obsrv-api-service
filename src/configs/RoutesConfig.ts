
export const routesConfig = {
  default: {
    api_id: "obsrv.api"
  },
  query: {
    native_query: {
      api_id: "obsrv.native.query",
      method: "post",
      path: "/dataset/v2/query/native-query"
    },
    sql_query: {
      api_id: "obsrv.sql.query",
      method: "post",
      path: "/dataset/v2/query/sql-query"
    }
  },
  config: {
    dataset: {
      save: {
        api_id: "obsrv.config.dataset.save",
        method: "post",
        path: "/obs/config/v2/dataset/save"
      },
      read: {
        api_id: "obsrv.config.dataset.read",
        method: "get",
        path: "/obs/config/v2/dataset/read"
      },
      update: {
        api_id: "obsrv.config.dataset.save",
        method: "patch",
        path: "/obs/config/v2/dataset/save"
      },
      list: {
        api_id: "obsrv.config.dataset.list",
        method: "post",
        path: "/obs/config/v2/dataset/list"
      },
      preset:{
        api_id: "obsrv.config.dataset.preset",
        method: "get",
        path: "/obs/config/v2/dataset/preset"
      }
    },
    datasource: {
      save: {
        api_id: "obsrv.config.datasource.save",
        method: "post",
        path: "/obs/config/v2/datasource/save"
      },
      read: {
        api_id: "obsrv.config.datasource.read",
        method: "get",
        path: "/obs/config/v2/datasource/read"
      },
      update: {
        api_id: "obsrv.config.datasource.save",
        method: "patch",
        path: "/obs/config/v2/datasource/save"
      },
      preset:{
        api_id: "obsrv.config.datasource.preset",
        method: "get",
        path: "/obs/config/v2/datasource/preset"
      }
    }
  },
  data_ingest: {
    api_id: "obsrv.dataset.data.in",
    method: "post",
    path: "/dataset/data/v2/in/*"
  }
}

