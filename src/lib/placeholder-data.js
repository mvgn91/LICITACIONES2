
const contratos = [
    {
        id: 1,
        nombre: "Remodelación de Oficinas Corporativas",
        cliente: "Innovatec S.A. de C.V.",
        montoConIVA: 750000.00,
        montoBase: 646551.72,
        fechaInicio: "2024-01-15",
        fechaTerminoEstimada: "2024-06-30",
        estado: "Activo",
        anticipoMonto: 150000.00,
        anticipoFecha: "2024-01-20",
        faseConstructoraAprobada: true,
        faseControlPresupuestalAprobada: false,
    },
    {
        id: 2,
        nombre: "Construcción de Bodega Industrial",
        cliente: "Logística Total S. de R.L.",
        montoConIVA: 1250000.00,
        montoBase: 1077586.21,
        fechaInicio: "2024-03-01",
        fechaTerminoEstimada: "2024-09-30",
        estado: "Activo",
        anticipoMonto: 250000.00,
        anticipoFecha: "2024-03-05",
        faseConstructoraAprobada: true,
        faseControlPresupuestalAprobada: true,
    },
    {
        id: 3,
        nombre: "Mantenimiento y Pintura de Fachada",
        cliente: "Condominio Las Palmas",
        montoConIVA: 250000.00,
        montoBase: 215517.24,
        fechaInicio: "2024-05-10",
        fechaTerminoEstimada: "2024-07-10",
        estado: "Pendiente",
        anticipoMonto: 50000.00,
        anticipoFecha: null,
        faseConstructoraAprobada: false,
        faseControlPresupuestalAprobada: false,
    },
    {
        id: 4,
        nombre: "Instalación Eléctrica en Centro Comercial",
        cliente: "Plaza del Sol",
        montoConIVA: 500000.00,
        montoBase: 431034.48,
        fechaInicio: "2023-11-01",
        fechaTerminoEstimada: "2024-02-28",
        estado: "En Retencion",
        anticipoMonto: 100000.00,
        anticipoFecha: "2023-11-05",
        faseConstructoraAprobada: true,
        faseControlPresupuestalAprobada: true,
    },
    // --- NUEVOS CONTRATOS DEMO ---
    {
        id: 5,
        nombre: "Sistema de Riego para Parque Central",
        cliente: "Gobierno de la Ciudad",
        montoConIVA: 300000.00,
        montoBase: 258620.69,
        fechaInicio: "2024-06-01",
        fechaTerminoEstimada: "2024-08-31",
        estado: "Activo",
        anticipoMonto: 60000.00,
        anticipoFecha: "2024-06-05",
        faseConstructoraAprobada: true,
        faseControlPresupuestalAprobada: true,
    },
    {
        id: 6,
        nombre: "Edificio de Departamentos 'Horizonte'",
        cliente: "Desarrollos Urbanos Futuro",
        montoConIVA: 5000000.00,
        montoBase: 4310344.83,
        fechaInicio: "2023-01-10",
        fechaTerminoEstimada: "2024-12-20",
        estado: "Activo",
        anticipoMonto: 1000000.00,
        anticipoFecha: "2023-01-15",
        faseConstructoraAprobada: true,
        faseControlPresupuestalAprobada: true,
    },
    {
        id: 7,
        nombre: "Ampliación de Clínica 'Buena Salud'",
        cliente: "Servicios Médicos Integrales",
        montoConIVA: 950000.00,
        montoBase: 818965.52,
        fechaInicio: "2024-02-01",
        fechaTerminoEstimada: "2024-07-31",
        estado: "Activo",
        anticipoMonto: 190000.00,
        anticipoFecha: "2024-02-10",
        faseConstructoraAprobada: true,
        faseControlPresupuestalAprobada: true,
    }
];

const estimaciones = [
    {
        id: 1,
        contratoId: 1,
        numero: "EST-001",
        descripcion: "Cimentación y estructura metálica.",
        monto: 200000.00,
        fecha: "2024-02-28",
        estado: "Aprobada"
    },
    {
        id: 2,
        contratoId: 1,
        numero: "EST-002",
        descripcion: "Albañilería y acabados iniciales.",
        monto: 150000.00,
        fecha: "2024-04-15",
        estado: "Pendiente"
    },
    {
        id: 3,
        contratoId: 2,
        numero: "EST-001",
        descripcion: "Movimiento de tierras y cimentación.",
        monto: 300000.00,
        fecha: "2024-04-20",
        estado: "Aprobada"
    },
    {
        id: 4,
        contratoId: 4,
        numero: "EST-FIN",
        descripcion: "Cierre de proyecto y entrega final.",
        monto: 150000.00,
        fecha: "2024-03-15",
        estado: "Aprobada"
    },
    // --- NUEVAS ESTIMACIONES DEMO ---
    {
        id: 5,
        contratoId: 5, // Para "Sistema de Riego"
        numero: "EST-001",
        descripcion: "Compra e instalación de tuberías principales.",
        monto: 100000.00,
        fecha: "2024-07-15",
        estado: "Aprobada"
    },
    {
        id: 6,
        contratoId: 6, // Para "Edificio 'Horizonte'"
        numero: "EST-001-A",
        descripcion: "Fase 1 a 5 de la construcción.",
        monto: 2000000.00,
        fecha: "2023-08-01",
        estado: "Aprobada"
    },
    {
        id: 7,
        contratoId: 6, // Para "Edificio 'Horizonte'"
        numero: "EST-001-B",
        descripcion: "Fase 6 a 10 de la construcción (98% completado).",
        monto: 1900000.00, // Total pagado = 1M (anticipo) + 2M + 1.9M = 4.9M. 4.9M / 5M = 98%
        fecha: "2024-06-01",
        estado: "Aprobada"
    },
    {
        id: 8,
        contratoId: 7, // Para "Ampliación Clínica"
        numero: "EST-001",
        descripcion: "Obra civil y estructural.",
        monto: 500000.00,
        fecha: "2024-05-20",
        estado: "Aprobada"
    },
    {
        id: 9,
        contratoId: 7, // Para "Ampliación Clínica"
        numero: "EST-002",
        descripcion: "Acabados e instalaciones especiales.",
        monto: 210000.00, // Total Pagado = 190k (anticipo) + 500k + 210k = 900k. Saldo restante = 50k
        fecha: "2024-07-01",
        estado: "Pendiente"
    }
];

module.exports = { contratos, estimaciones };
