export const routesConfig = {
  default: {
    api_id: "obsrv.api"
  },
  query: {
    native_query: {
      api_id: "obsrv.native.query",
      method: "post",
      path: "/obsrv/v1/query"
    },
    sql_query: {
      api_id: "obsrv.sql.query",
      method: "post",
      path: "/obsrv/v1/sql-query"
    }
  },
  config: {
    dataset: {
      save: {
        api_id: "obsrv.config.dataset.create",
        method: "post",
        path: "/obsrv/v1/datasets"
      },
      read: {
        api_id: "obsrv.config.dataset.read",
        method: "get",
        path: "/obsrv/v1/datasets/:datasetId"
      },
      update: {
        api_id: "obsrv.config.dataset.update",
        method: "patch",
        path: "/obsrv/v1/datasets"
      },
      list: {
        api_id: "obsrv.config.dataset.list",
        method: "post",
        path: "/obsrv/v1/datasets/list"
      }
    },
    datasource: {
      save: {
        api_id: "obsrv.config.datasource.create",
        method: "post",
        path: "/obsrv/v1/datasources"
      },
      read: {
        api_id: "obsrv.config.datasource.read",
        method: "get",
        path: "/obsrv/v1/datasources/:datasourceId"
      },
      update: {
        api_id: "obsrv.config.datasource.update",
        method: "patch",
        path: "/obsrv/v1/datasources"
      },
      list: {
        api_id: "obsrv.config.datasource.list",
        method: "post",
        path: "/obsrv/v1/datasources/list"
      }
    },
    dataset_source_config: {
      save: {
        api_id: "obsrv.config.dataset.source.config.create",
        method: "post",
        path: "/obsrv/v1/datasets/source/config"
      },
      read: {
        api_id: "obsrv.config.dataset.source.config.read",
        method: "get",
        path: "/obsrv/v1/datasets/source/config/:datasetId"
      },
      update: {
        api_id: "obsrv.config.dataset.source.config.update",
        method: "patch",
        path: "/obsrv/v1/datasets/source/config"
      },
      list: {
        api_id: "obsrv.config.dataset.source.config.list",
        method: "post",
        path: "/obsrv/v1/datasets/source/config/list"
      }
    },
    dataset_transformation: {
      save: {
        api_id: "obsrv.config.dataset.transformation.create",
        method: "post",
        path: "/obsrv/v1/datasets/transformation"
      },
      read: {
        api_id: "obsrv.config.dataset.transformation.read",
        method: "get",
        path: "/obsrv/v1/datasets/transformation/:datasetId"
      },
      update: {
        api_id: "obsrv.config.dataset.transformation.update",
        method: "patch",
        path: "/obsrv/v1/datasets/transformation"
      },
      list: {
        api_id: "obsrv.config.dataset.transformation.list",
        method: "post",
        path: "/obsrv/v1/datasets/transformation/list"
      }
    }

  },
  data_ingest: {
    api_id: "obsrv.dataset.data.in",
    method: "post",
    path: "/obsrv/v1/data/:datasetId"
  },
  prometheus: {
    method: "get",
    path: "/metrics"
  }
}

