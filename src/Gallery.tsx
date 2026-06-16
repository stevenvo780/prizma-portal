/**
 * Gallery.tsx — visual QA gallery of the prizma-ui design system.
 * Renders every component (variants, sizes, tones, interactive overlays)
 * inside a PrizmaRoot module="portal" surface.
 *
 * Open via ?gallery in the URL (wired in App.tsx).
 */
import { useState } from "react";
import {
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  Star,
  Inbox,
  Folder,
  FileText,
  FlaskConical,
} from "lucide-react";
import {
  PrizmaRoot,
  useTheme,
  // Layout
  Row,
  Stack,
  Grid,
  Spacer,
  // Buttons
  Button,
  ButtonGroup,
  IconButton,
  // Card
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  // Badge / Tag / Status
  Badge,
  type BadgeTone,
  Tag,
  type TagTone,
  StatusDot,
  // Form
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Segmented,
  Field,
  Label,
  InputGroup,
  InputAddon,
  NumberInput,
  PasswordInput,
  PinInput,
  SearchInput,
  Slider,
  MultiSelect,
  Rating,
  FileUpload,
  // Table
  TableWrap,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  // DataTable
  DataTable,
  type DataTableColumn,
  // Combobox / DatePicker
  Combobox,
  DatePicker,
  // Feedback
  Alert,
  type AlertTone,
  InlineMessage,
  // Stat / Progress / Loading
  Stat,
  StatCard,
  MetricGrid,
  Progress,
  Spinner,
  Skeleton,
  LoadingOverlay,
  // Charts
  Sparkline,
  BarChart,
  LineChart,
  DonutChart,
  // Navigation
  Tabs,
  Breadcrumb,
  Pagination,
  Steps,
  Timeline,
  TimelineItem,
  // Avatar / Divider / Tooltip
  Avatar,
  AvatarGroup,
  Divider,
  Tooltip,
  // Overlays
  Modal,
  ModalFooter,
  Drawer,
  ToastProvider,
  useToast,
  CommandPalette,
  ConfirmDialog,
  // Popover / Dropdown / Menu
  Popover,
  DropdownMenu,
  // Misc UI
  Accordion,
  AccordionItem,
  EmptyState,
  CopyButton,
  Banner,
  Result,
  Money,
  CreditMeter,
  Keypad,
  // Data structures
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  Tree,
  TreeNode,
  // Chat
  ChatBubble,
  ChatThread,
  // Cart
  Cart,
  CartLine,
  // Misc
  DescriptionList,
  Panel,
  PageHeader,
  Hero,
  Toolbar,
  SplitView,
  AppShell,
  ThemeToggle,
  List,
  CopyButton as _CopyButton,
} from "prizma-ui";

// ---- constants ----------------------------------------------------------------

const BUTTON_VARIANTS = [
  "primary",
  "accent",
  "module",
  "secondary",
  "ghost",
  "danger",
  "link",
] as const;
const BUTTON_SIZES = ["sm", "md", "lg"] as const;
const BADGE_TONES: BadgeTone[] = [
  "neutral",
  "primary",
  "module",
  "success",
  "warning",
  "danger",
  "info",
];
const TAG_TONES: TagTone[] = [
  "neutral",
  "primary",
  "module",
  "success",
  "warning",
  "danger",
  "info",
];
const ALERT_TONES: AlertTone[] = ["info", "success", "warning", "danger"];

// ---- Section wrapper ----------------------------------------------------------

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 8 }}>
      <h2
        style={{
          fontSize: 20,
          marginBottom: 14,
          paddingBottom: 6,
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        {title}
      </h2>
      <Card>
        <CardBody>
          <Stack gap={16}>{children}</Stack>
        </CardBody>
      </Card>
    </section>
  );
}

// ---- Toast demo ---------------------------------------------------------------

function ToastDemo() {
  const { toast } = useToast();
  return (
    <Row wrap gap={10}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          toast({ message: "Guardado con éxito.", variant: "success", title: "Listo" })
        }
      >
        Toast success
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ message: "Revisa los campos.", variant: "warning" })}
      >
        Toast warning
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ message: "Algo falló.", variant: "danger" })}
      >
        Toast danger
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ message: "Mensaje informativo." })}
      >
        Toast default
      </Button>
    </Row>
  );
}

// ---- DataTable sample data ----------------------------------------------------

interface ProductRow {
  id: number;
  name: string;
  status: string;
  amount: number;
}

const DT_ROWS: ProductRow[] = [
  { id: 1, name: "Hermes", status: "activo", amount: 1240 },
  { id: 2, name: "Iris", status: "pendiente", amount: 880 },
  { id: 3, name: "Talanton", status: "vencido", amount: 2015 },
  { id: 4, name: "Talaria", status: "activo", amount: 450 },
  { id: 5, name: "Pistis", status: "activo", amount: 3300 },
];

const DT_COLS: DataTableColumn<ProductRow>[] = [
  { key: "name", header: "Producto", sortable: true },
  {
    key: "status",
    header: "Estado",
    render: (r) => {
      const tone =
        r.status === "activo"
          ? "success"
          : r.status === "pendiente"
          ? "warning"
          : "danger";
      return <Badge tone={tone}>{r.status}</Badge>;
    },
  },
  {
    key: "amount",
    header: "Monto",
    align: "right",
    sortable: true,
    render: (r) => <Money value={r.amount} />,
  },
];

// ---- Main Gallery component ---------------------------------------------------

export function Gallery() {
  const { theme, toggle } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [seg, setSeg] = useState("flow");
  const [radio, setRadio] = useState("a");
  const [page, setPage] = useState(3);
  const [dpDate, setDpDate] = useState("");
  const [comboVal, setComboVal] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [keypadVal, setKeypadVal] = useState("0");
  const [cartLines, setCartLines] = useState([
    { name: "Hermes Premium", qty: 2, price: 49900 },
    { name: "Pistis Básico", qty: 1, price: 29900 },
  ]);
  const [stepCurrent, setStepCurrent] = useState(1);

  return (
    <ToastProvider>
      <PrizmaRoot
        module="portal"
        style={{ minHeight: "100vh", background: "var(--c-bg)" }}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <header className="cui-shell__topbar" style={{ position: "sticky" }}>
          <strong
            style={{
              fontFamily: "var(--c-font-display)",
              fontSize: 20,
              letterSpacing: "-0.02em",
            }}
          >
            prizma-ui — Galería QA
          </strong>
          <Badge tone="primary">design system</Badge>
          <Spacer />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            leftIcon={theme === "dark" ? <Sun size={15} aria-hidden /> : <Moon size={15} aria-hidden />}
          >
            {theme === "dark" ? "Claro" : "Oscuro"}
          </Button>
        </header>

        <main
          className="cui-container"
          style={{
            paddingBlock: 28,
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {/* ── BUTTON ──────────────────────────────────────────────────────── */}
          <Section title="Button">
            {BUTTON_SIZES.map((size) => (
              <Row key={size} wrap gap={10}>
                {BUTTON_VARIANTS.map((variant) => (
                  <Button key={variant} variant={variant} size={size}>
                    {variant} / {size}
                  </Button>
                ))}
              </Row>
            ))}
            <Row wrap gap={10}>
              <Button loading>Cargando</Button>
              <Button disabled>Deshabilitado</Button>
              <Button leftIcon={<ArrowLeft size={16} aria-hidden />}>Con icono izq.</Button>
              <Button rightIcon={<ArrowRight size={16} aria-hidden />}>Con icono der.</Button>
              <IconButton aria-label="Acción"><Star size={16} aria-hidden /></IconButton>
            </Row>
            <Button block variant="accent">
              Botón block
            </Button>
            <Row wrap gap={10}>
              <ButtonGroup>
                <Button variant="secondary" size="sm">Izq</Button>
                <Button variant="secondary" size="sm">Centro</Button>
                <Button variant="secondary" size="sm">Der</Button>
              </ButtonGroup>
            </Row>
          </Section>

          {/* ── CARD ─────────────────────────────────────────────────────────── */}
          <Section title="Card">
            <Grid cols="repeat(auto-fill, minmax(240px, 1fr))" gap={16}>
              <Card>
                <CardHeader title="Card básica" subtitle="con header" />
                <CardBody>Cuerpo de la tarjeta con contenido de ejemplo.</CardBody>
                <CardFooter>
                  <Button size="sm">Acción</Button>
                </CardFooter>
              </Card>
              <Card raised>
                <CardBody>Card con elevación (raised).</CardBody>
              </Card>
              <Card interactive>
                <CardBody>Card interactiva (hover).</CardBody>
              </Card>
            </Grid>
          </Section>

          {/* ── BADGE / TAG / STATUS ────────────────────────────────────────── */}
          <Section title="Badge · Tag · StatusDot">
            <Row wrap gap={10}>
              {BADGE_TONES.map((tone) => (
                <Badge key={tone} tone={tone}>
                  {tone}
                </Badge>
              ))}
            </Row>
            <Row wrap gap={10}>
              {BADGE_TONES.map((tone) => (
                <Badge key={tone} tone={tone} dot>
                  {tone} dot
                </Badge>
              ))}
            </Row>
            <Row wrap gap={10}>
              {TAG_TONES.map((tone) => (
                <Tag key={tone} tone={tone} dot>
                  {tone}
                </Tag>
              ))}
              <Tag tone="primary" onRemove={() => {}} removeLabel="Quitar">
                removible
              </Tag>
            </Row>
            <Row wrap gap={12} style={{ alignItems: "center" }}>
              {(["neutral", "primary", "success", "warning", "danger", "info"] as const).map((t) => (
                <Row key={t} gap={6} style={{ alignItems: "center" }}>
                  <StatusDot tone={t} />
                  <span style={{ fontSize: 13 }}>{t}</span>
                </Row>
              ))}
            </Row>
          </Section>

          {/* ── FORM CONTROLS ───────────────────────────────────────────────── */}
          <Section title="Form controls">
            <Grid cols="repeat(auto-fit, minmax(260px, 1fr))" gap={16}>
              <Field label="Input" hint="texto libre" htmlFor="g-input">
                <Input id="g-input" placeholder="Escribe algo…" />
              </Field>
              <Field
                label="Input inválido"
                error="Este campo es obligatorio"
                htmlFor="g-input-bad"
              >
                <Input id="g-input-bad" invalid defaultValue="valor inválido" />
              </Field>
              <Field label="Input group" htmlFor="g-input-grp">
                <InputGroup>
                  <InputAddon>https://</InputAddon>
                  <Input id="g-input-grp" placeholder="prizma.app" />
                </InputGroup>
              </Field>
              <Field label="Select" htmlFor="g-select">
                <Select id="g-select" defaultValue="2">
                  <option value="1">Opción 1</option>
                  <option value="2">Opción 2</option>
                  <option value="3">Opción 3</option>
                </Select>
              </Field>
              <Field label="Textarea" htmlFor="g-textarea">
                <Textarea id="g-textarea" rows={3} placeholder="Comentarios…" />
              </Field>
              <Field label="Password" htmlFor="g-pw">
                <PasswordInput id="g-pw" placeholder="Contraseña" />
              </Field>
              <Field label="NumberInput" htmlFor="g-num">
                <NumberInput id="g-num" defaultValue={42} min={0} max={100} />
              </Field>
              <Field label="SearchInput" htmlFor="g-search">
                <SearchInput id="g-search" placeholder="Buscar…" />
              </Field>
              <Field label="Standalone label">
                <Label hint="opcional">Etiqueta suelta</Label>
              </Field>
            </Grid>

            <Divider label="Selección" />

            <Row wrap gap={24}>
              <Stack gap={8}>
                <Checkbox label="Acepto los términos" defaultChecked />
                <Checkbox label="Suscribirme al boletín" />
                <Checkbox label="Deshabilitado" disabled />
              </Stack>

              <RadioGroup
                legend="Radio group"
                name="g-radio"
                value={radio}
                onChange={(v) => setRadio(v)}
              >
                <RadioGroupItem value="a" label="Opción A" />
                <RadioGroupItem value="b" label="Opción B" />
                <RadioGroupItem value="c" label="Opción C" />
              </RadioGroup>

              <Stack gap={8}>
                <Radio name="g-radio-solo" label="Radio suelto 1" defaultChecked />
                <Radio name="g-radio-solo" label="Radio suelto 2" />
              </Stack>

              <Stack gap={8}>
                <Switch defaultChecked /> <span>Switch activo</span>
                <Switch /> <span>Switch inactivo</span>
                <Switch disabled /> <span>Switch deshabilitado</span>
              </Stack>
            </Row>

            <Divider />

            <Segmented
              value={seg}
              onChange={setSeg}
              options={[
                { label: "Flujo", value: "flow" },
                { label: "Lista", value: "list" },
                { label: "Tablero", value: "board" },
              ]}
            />

            <Divider label="Extras" />

            <Row wrap gap={16}>
              <Stack gap={6}>
                <Label>Slider</Label>
                <Slider defaultValue={40} min={0} max={100} style={{ width: 200 }} />
              </Stack>
              <Stack gap={6}>
                <Label>Rating</Label>
                <Rating value={3} max={5} readonly />
              </Stack>
              <Stack gap={6}>
                <Label>MultiSelect</Label>
                <MultiSelect
                  options={[
                    { label: "React", value: "react" },
                    { label: "TypeScript", value: "ts" },
                    { label: "Vite", value: "vite" },
                  ]}
                  placeholder="Elige tecnologías"
                />
              </Stack>
              <Stack gap={6}>
                <Label>FileUpload</Label>
                <FileUpload />
              </Stack>
            </Row>
          </Section>

          {/* ── COMBOBOX ────────────────────────────────────────────────────── */}
          <Section title="Combobox">
            <Grid cols="repeat(auto-fit, minmax(240px, 1fr))" gap={16}>
              <Field label="Combobox" htmlFor="g-combo">
                <Combobox
                  id="g-combo"
                  options={[
                    { label: "Hermes", value: "hermes" },
                    { label: "Iris", value: "iris" },
                    { label: "Talanton", value: "talanton" },
                    { label: "Talaria", value: "talaria" },
                    { label: "Pistis", value: "pistis" },
                  ]}
                  value={comboVal}
                  onChange={(v) => setComboVal(v)}
                  placeholder="Buscar producto…"
                  clearable
                />
              </Field>
            </Grid>
          </Section>

          {/* ── DATE PICKER ─────────────────────────────────────────────────── */}
          <Section title="DatePicker">
            <Row wrap gap={16}>
              <Field label="Fecha de inicio" htmlFor="g-dp">
                <DatePicker
                  id="g-dp"
                  value={dpDate}
                  onChange={setDpDate}
                  placeholder="Selecciona una fecha"
                />
              </Field>
              <Field label="Con límites" htmlFor="g-dp2">
                <DatePicker
                  id="g-dp2"
                  min="2025-01-01"
                  max="2026-12-31"
                  placeholder="Dentro del rango"
                />
              </Field>
            </Row>
          </Section>

          {/* ── PIN INPUT ───────────────────────────────────────────────────── */}
          <Section title="PinInput">
            <PinInput
              length={6}
              value={pin}
              onChange={setPin}
              placeholder="•"
            />
          </Section>

          {/* ── TABLE ───────────────────────────────────────────────────────── */}
          <Section title="Table (básica)">
            <TableWrap>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Producto</Th>
                    <Th>Estado</Th>
                    <Th>Monto</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Hermes</Td>
                    <Td>
                      <Badge tone="success">activo</Badge>
                    </Td>
                    <Td>$1,240</Td>
                  </Tr>
                  <Tr>
                    <Td>Iris</Td>
                    <Td>
                      <Badge tone="warning">pendiente</Badge>
                    </Td>
                    <Td>$880</Td>
                  </Tr>
                  <Tr>
                    <Td>Talanton</Td>
                    <Td>
                      <Badge tone="danger">vencido</Badge>
                    </Td>
                    <Td>$2,015</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableWrap>
          </Section>

          {/* ── DATA TABLE ──────────────────────────────────────────────────── */}
          <Section title="DataTable">
            <DataTable
              columns={DT_COLS}
              rows={DT_ROWS}
              rowKey={(r) => r.id}
              sortable
              selectable
              pageSize={3}
              ariaLabel="Tabla de productos"
            />
          </Section>

          {/* ── ALERT ───────────────────────────────────────────────────────── */}
          <Section title="Alert · InlineMessage">
            {ALERT_TONES.map((tone) => (
              <Alert key={tone} tone={tone} title={`Alerta ${tone}`}>
                Mensaje de ejemplo para la alerta de tipo {tone}.
              </Alert>
            ))}
            <Row wrap gap={16}>
              {(["info", "success", "warning", "danger"] as const).map((t) => (
                <InlineMessage key={t} tone={t}>
                  InlineMessage {t}
                </InlineMessage>
              ))}
            </Row>
          </Section>

          {/* ── STAT ────────────────────────────────────────────────────────── */}
          <Section title="Stat · StatCard · MetricGrid">
            <Grid cols="repeat(auto-fit, minmax(180px, 1fr))" gap={16}>
              <Stat label="Ingresos" value="$48.2k" delta="12.4%" trend="up" />
              <Stat label="Churn" value="2.1%" delta="0.3%" trend="down" />
              <Stat label="Usuarios" value="3,418" delta="58" trend="up" />
              <Stat label="Tickets" value="12" />
            </Grid>
            <Grid cols="repeat(auto-fit, minmax(220px, 1fr))" gap={16}>
              <StatCard
                label="MRR"
                value="$48.2k"
                delta="+12.4%"
                trend="up"
                spark={[30, 42, 38, 55, 48, 62, 70]}
              />
              <StatCard
                label="Churn rate"
                value="2.1%"
                delta="-0.3%"
                trend="down"
                spark={[5, 4, 6, 3, 2, 3, 2]}
                sparkColor="var(--c-danger)"
              />
              <StatCard
                label="NPS"
                value="72"
                delta="+5 pts"
                trend="up"
              />
            </Grid>
            <MetricGrid
              aria-label="Métricas del mes"
              metrics={[
                { label: "Ingresos", value: "$48.2k", delta: "+12%", trend: "up", sparkline: [30, 42, 55, 48, 62] },
                { label: "Usuarios", value: "3,418", delta: "+58", trend: "up", sparkline: [100, 120, 115, 140, 160] },
                { label: "Conversión", value: "4.2%", delta: "-0.1%", trend: "down", sparkline: [5, 4.5, 4.8, 4.3, 4.2] },
                { label: "Tickets", value: "12", sparkline: [8, 10, 7, 12, 11] },
              ]}
            />
          </Section>

          {/* ── PROGRESS / SPINNER / SKELETON ───────────────────────────────── */}
          <Section title="Progress · Spinner · Skeleton · LoadingOverlay">
            <Stack gap={10}>
              <Progress value={25} />
              <Progress value={60} />
              <Progress value={90} />
            </Stack>
            <Row wrap gap={20} style={{ alignItems: "center" }}>
              <Spinner />
              <Spinner size={32} />
              <Spinner size={48} label="Cargando datos" />
            </Row>
            <Stack gap={8}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="80%" height={16} />
              <Skeleton block height={48} radius={12} />
              <Skeleton width={48} height={48} radius="50%" />
            </Stack>
            <div style={{ position: "relative", height: 80 }}>
              <LoadingOverlay show />
            </div>
          </Section>

          {/* ── CHARTS ──────────────────────────────────────────────────────── */}
          <Section title="Charts — Sparkline · Bar · Line · Donut">
            <Row wrap gap={24} style={{ alignItems: "flex-end" }}>
              <Stack gap={6}>
                <span style={{ fontSize: 13, color: "var(--c-text-muted)" }}>Sparkline</span>
                <Sparkline data={[5, 8, 6, 12, 10, 14, 11, 16]} width={120} height={32} area showLastPoint />
              </Stack>
              <Stack gap={6}>
                <span style={{ fontSize: 13, color: "var(--c-text-muted)" }}>Sparkline (verde)</span>
                <Sparkline
                  data={[3, 6, 4, 9, 7, 11, 9, 13]}
                  width={120}
                  height={32}
                  color="var(--c-success)"
                  area
                />
              </Stack>
            </Row>
            <BarChart
              data={[
                { label: "Ene", value: 4200 },
                { label: "Feb", value: 3800 },
                { label: "Mar", value: 5100 },
                { label: "Abr", value: 4700 },
                { label: "May", value: 6200 },
                { label: "Jun", value: 5800 },
              ]}
              height={180}
              ariaLabel="Ingresos mensuales"
            />
            <LineChart
              labels={["Ene", "Feb", "Mar", "Abr", "May", "Jun"]}
              series={[
                { name: "Ingresos", data: [4200, 3800, 5100, 4700, 6200, 5800] },
                { name: "Gastos", data: [3100, 3400, 3900, 3700, 4100, 4400] },
              ]}
              height={200}
              area
              smooth
              ariaLabel="Ingresos vs Gastos"
            />
            <DonutChart
              data={[
                { label: "Hermes", value: 42 },
                { label: "Iris", value: 28 },
                { label: "Talaria", value: 18 },
                { label: "Pistis", value: 12 },
              ]}
              centerLabel="100%"
              centerSubLabel="Total"
              ariaLabel="Distribución de cartera"
            />
          </Section>

          {/* ── TABS ────────────────────────────────────────────────────────── */}
          <Section title="Tabs">
            <Tabs
              defaultValue="resumen"
              tabs={[
                {
                  key: "resumen",
                  label: "Resumen",
                  content: <p>Contenido de la pestaña Resumen.</p>,
                },
                {
                  key: "detalle",
                  label: "Detalle",
                  content: <p>Contenido de la pestaña Detalle.</p>,
                },
                {
                  key: "config",
                  label: "Configuración",
                  content: <p>Contenido de la pestaña Configuración.</p>,
                },
              ]}
            />
          </Section>

          {/* ── BREADCRUMB / PAGINATION ─────────────────────────────────────── */}
          <Section title="Breadcrumb · Pagination">
            <Breadcrumb
              items={[
                { label: "Inicio", href: "#" },
                { label: "Productos", href: "#" },
                { label: "Hermes" },
              ]}
            />
            <Pagination page={page} pageCount={10} onChange={setPage} />
          </Section>

          {/* ── STEPS ───────────────────────────────────────────────────────── */}
          <Section title="Steps">
            <Steps
              current={stepCurrent}
              onStepClick={(i) => setStepCurrent(i)}
              steps={[
                { label: "Datos personales", description: "Nombre y documento" },
                { label: "Dirección", description: "Ciudad y barrio" },
                { label: "Confirmación", description: "Revisar y enviar" },
              ]}
            />
          </Section>

          {/* ── TIMELINE ────────────────────────────────────────────────────── */}
          <Section title="Timeline">
            <Timeline>
              <TimelineItem
                title="Solicitud enviada"
                time="2026-06-01 09:00"
                tone="success"
              >
                La solicitud fue recibida y puesta en cola.
              </TimelineItem>
              <TimelineItem
                title="En revisión"
                time="2026-06-02 10:30"
                tone="warning"
              >
                El equipo de riesgo está evaluando la solicitud.
              </TimelineItem>
              <TimelineItem
                title="Aprobada"
                time="2026-06-03 14:15"
                tone="primary"
              >
                La solicitud fue aprobada; pendiente de desembolso.
              </TimelineItem>
              <TimelineItem title="Pendiente de pago" tone="neutral">
                Esperando confirmación del banco.
              </TimelineItem>
            </Timeline>
          </Section>

          {/* ── EMPTY STATE ─────────────────────────────────────────────────── */}
          <Section title="EmptyState">
            <EmptyState
              icon={<Inbox size={32} aria-hidden />}
              title="Sin resultados"
              description="No encontramos nada que coincida con tu búsqueda."
              action={<Button size="sm">Limpiar filtros</Button>}
            />
          </Section>

          {/* ── AVATAR / DIVIDER / TOOLTIP ──────────────────────────────────── */}
          <Section title="Avatar · AvatarGroup · Divider · Tooltip">
            <Row wrap gap={12} style={{ alignItems: "center" }}>
              <Avatar name="Ada Lovelace" />
              <Avatar name="Grace Hopper" size={56} />
              <Avatar
                name="Prizma"
                src="https://invalid.example/none.png"
                size={40}
              />
            </Row>
            <AvatarGroup
              max={4}
              size={36}
              avatars={["Ana", "Ben", "Clara", "Diego", "Eva"].map((n) => ({ name: n }))}
            />
            <Divider label="Horizontal" />
            <Row gap={16} style={{ height: 40, alignItems: "center" }}>
              <span>izq</span>
              <Divider vertical />
              <span>der</span>
            </Row>
            <Row>
              <Tooltip label="Soy un tooltip">
                <Button variant="secondary" size="sm">
                  Hover para tooltip
                </Button>
              </Tooltip>
            </Row>
          </Section>

          {/* ── ACCORDION ───────────────────────────────────────────────────── */}
          <Section title="Accordion">
            <Accordion allowMultiple>
              <AccordionItem title="¿Qué es prizma-ui?" defaultOpen>
                Una librería de componentes React lista para producción, construida con
                tokens de diseño, accesibilidad WCAG 2.1 AA y soporte para temas.
              </AccordionItem>
              <AccordionItem title="¿Cómo instalo el paquete?">
                <code>npm install prizma-ui</code> y luego importa el CSS:
                <code>import "prizma-ui/styles.css"</code>.
              </AccordionItem>
              <AccordionItem title="Sección deshabilitada" disabled>
                Este contenido no es accesible.
              </AccordionItem>
            </Accordion>
          </Section>

          {/* ── BANNER ──────────────────────────────────────────────────────── */}
          <Section title="Banner">
            {(["info", "success", "warning", "danger"] as const).map((tone) => (
              <Banner
                key={tone}
                tone={tone}
                title={`Banner ${tone}`}
                action={{ label: "Ver más", onClick: () => {} }}
                onClose={() => {}}
              >
                Mensaje de banner de tipo {tone} con acción y botón de cierre.
              </Banner>
            ))}
          </Section>

          {/* ── RESULT ──────────────────────────────────────────────────────── */}
          <Section title="Result">
            <Grid cols="repeat(auto-fit, minmax(220px, 1fr))" gap={16}>
              {(["success", "error", "info", "empty"] as const).map((status) => (
                <Result
                  key={status}
                  status={status}
                  title={`Resultado ${status}`}
                  description="Descripción de soporte del resultado."
                  actions={<Button size="sm">Acción</Button>}
                />
              ))}
            </Grid>
          </Section>

          {/* ── MONEY ───────────────────────────────────────────────────────── */}
          <Section title="Money">
            <Row wrap gap={24} style={{ alignItems: "center" }}>
              <Money value={1234567} />
              <Money value={-50000} tone="negative" />
              <Money value={99900} showSign tone="positive" />
              <Money value={0} />
            </Row>
          </Section>

          {/* ── CREDIT METER ────────────────────────────────────────────────── */}
          <Section title="CreditMeter">
            <Grid cols="repeat(auto-fit, minmax(240px, 1fr))" gap={16}>
              <CreditMeter used={200000} limit={1000000} label="Cupo disponible" />
              <CreditMeter used={750000} limit={1000000} label="Cupo (advertencia)" />
              <CreditMeter used={960000} limit={1000000} label="Cupo crítico" />
            </Grid>
          </Section>

          {/* ── KANBAN ──────────────────────────────────────────────────────── */}
          <Section title="Kanban">
            <KanbanBoard aria-label="Tablero de tareas">
              <KanbanColumn title="Por hacer" count={3} accent="var(--c-neutral-400)">
                <KanbanCard>Diseñar pantalla de login</KanbanCard>
                <KanbanCard>Revisar tokens de color</KanbanCard>
                <KanbanCard>Documentar API</KanbanCard>
              </KanbanColumn>
              <KanbanColumn title="En progreso" count={2} accent="var(--c-warning)">
                <KanbanCard>Implementar DataTable</KanbanCard>
                <KanbanCard>Escribir tests de accesibilidad</KanbanCard>
              </KanbanColumn>
              <KanbanColumn title="Hecho" count={4} accent="var(--c-success)">
                <KanbanCard>Setup del monorepo</KanbanCard>
                <KanbanCard>CI/CD pipeline</KanbanCard>
                <KanbanCard>Galería de componentes</KanbanCard>
                <KanbanCard>Publicar en npm</KanbanCard>
              </KanbanColumn>
            </KanbanBoard>
          </Section>

          {/* ── TREE ────────────────────────────────────────────────────────── */}
          <Section title="Tree">
            <Tree label="Estructura del proyecto">
              <TreeNode label="src" defaultOpen icon={<Folder size={15} aria-hidden />}>
                <TreeNode label="components" defaultOpen icon={<Folder size={15} aria-hidden />}>
                  <TreeNode label="Button.tsx" icon={<FileText size={15} aria-hidden />} />
                  <TreeNode label="Card.tsx" icon={<FileText size={15} aria-hidden />} />
                  <TreeNode label="DataTable.tsx" icon={<FileText size={15} aria-hidden />} />
                </TreeNode>
                <TreeNode label="utils" icon={<Folder size={15} aria-hidden />}>
                  <TreeNode label="cx.ts" icon={<FileText size={15} aria-hidden />} />
                  <TreeNode label="format.ts" icon={<FileText size={15} aria-hidden />} />
                </TreeNode>
                <TreeNode label="index.ts" icon={<FileText size={15} aria-hidden />} />
              </TreeNode>
              <TreeNode label="tests" icon={<Folder size={15} aria-hidden />}>
                <TreeNode label="Button.test.tsx" icon={<FlaskConical size={15} aria-hidden />} />
              </TreeNode>
              <TreeNode label="package.json" icon={<FileText size={15} aria-hidden />} />
            </Tree>
          </Section>

          {/* ── CHAT THREAD ─────────────────────────────────────────────────── */}
          <Section title="ChatThread">
            <ChatThread>
              <ChatBubble from="them" time="09:00">
                Hola, ¿cómo puedo solicitar un crédito?
              </ChatBubble>
              <ChatBubble from="me" time="09:01" status="read">
                Con gusto te ayudo. Primero necesito tu número de cédula.
              </ChatBubble>
              <ChatBubble from="them" time="09:02">
                Mi cédula es 12345678.
              </ChatBubble>
              <ChatBubble from="me" time="09:03" status="delivered">
                Perfecto, ya tengo tu información. Estamos procesando tu solicitud.
              </ChatBubble>
            </ChatThread>
          </Section>

          {/* ── CART ────────────────────────────────────────────────────────── */}
          <Section title="Cart">
            <Cart
              lines={cartLines}
              discounts={[{ label: "Descuento 10%", amount: -cartLines.reduce((a, l) => a + l.qty * l.price, 0) * 0.1 }]}
              footer={<Button block variant="primary">Pagar ahora</Button>}
            >
              {cartLines.map((line, i) => (
                <CartLine
                  key={i}
                  name={line.name}
                  qty={line.qty}
                  price={line.price}
                  onQty={(qty) => {
                    setCartLines((prev) => {
                      const next = [...prev];
                      next[i] = { ...next[i], qty };
                      return next;
                    });
                  }}
                  onRemove={() => setCartLines((prev) => prev.filter((_, j) => j !== i))}
                />
              ))}
            </Cart>
          </Section>

          {/* ── KEYPAD ──────────────────────────────────────────────────────── */}
          <Section title="Keypad">
            <Stack gap={12} style={{ alignItems: "flex-start" }}>
              <div
                style={{
                  fontSize: 28,
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 160,
                  textAlign: "right",
                  padding: "8px 12px",
                  border: "1px solid var(--c-border)",
                  borderRadius: 8,
                }}
              >
                {keypadVal}
              </div>
              <Keypad
                onKey={(k) =>
                  setKeypadVal((prev) =>
                    prev === "0" && k !== "." ? k : prev + k
                  )
                }
                onBackspace={() =>
                  setKeypadVal((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)))
                }
              />
            </Stack>
          </Section>

          {/* ── DESCRIPTION LIST / PANEL ────────────────────────────────────── */}
          <Section title="DescriptionList · Panel">
            <DescriptionList
              items={[
                { label: "Nombre", value: "Ada Lovelace" },
                { label: "NIT", value: "900.123.456-1" },
                { label: "Estado", value: <Badge tone="success">activo</Badge> },
                { label: "Cupo", value: <Money value={5000000} /> },
              ]}
            />
            <Panel title="Panel básico" collapsible>
              Contenido colapsable del panel. Puede contener cualquier componente.
            </Panel>
          </Section>

          {/* ── COPY BUTTON ─────────────────────────────────────────────────── */}
          <Section title="CopyButton">
            <Row wrap gap={12}>
              <CopyButton value="prizma-ui" size="sm" />
              <CopyButton value="npm install prizma-ui" />
              <code style={{ fontSize: 13 }}>npm install prizma-ui</code>
            </Row>
          </Section>

          {/* ── OVERLAYS: MODAL / DRAWER / TOAST / CONFIRM / COMMAND ────────── */}
          <Section title="Overlays — Modal · Drawer · Toast · ConfirmDialog · CommandPalette">
            <Row wrap gap={10}>
              <Button onClick={() => setModalOpen(true)}>Abrir Modal</Button>
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                Abrir Drawer
              </Button>
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                ConfirmDialog
              </Button>
              <Button variant="ghost" onClick={() => setCmdOpen(true)}>
                Command Palette (Ctrl/Cmd + K)
              </Button>
            </Row>
            <ToastDemo />
          </Section>
        </main>

        {/* ── Modal ─────────────────────────────────────────────────────────── */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Modal de demostración"
          footer={
            <ModalFooter>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Confirmar
              </Button>
            </ModalFooter>
          }
        >
          <p>
            Este es el contenido del modal. Sirve para verificar el overlay, el
            foco y el botón de cierre.
          </p>
        </Modal>

        {/* ── Drawer ────────────────────────────────────────────────────────── */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Drawer lateral"
        >
          <Stack gap={12}>
            <p>Panel deslizante para detalles y formularios secundarios.</p>
            <Button block onClick={() => setDrawerOpen(false)}>
              Cerrar
            </Button>
          </Stack>
        </Drawer>

        {/* ── ConfirmDialog ─────────────────────────────────────────────────── */}
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => setConfirmOpen(false)}
          title="¿Eliminar registro?"
          message="Esta acción no se puede deshacer. El registro será eliminado permanentemente."
          tone="danger"
          confirmLabel="Eliminar"
        />

        {/* ── CommandPalette ────────────────────────────────────────────────── */}
        <CommandPalette
          open={cmdOpen}
          onClose={() => setCmdOpen(false)}
          placeholder="Buscar acción…"
          commands={[
            {
              id: "home",
              label: "Ir al inicio",
              group: "Navegación",
              description: "Volver al dashboard principal",
              onRun: () => setCmdOpen(false),
            },
            {
              id: "new-client",
              label: "Nuevo cliente",
              group: "Acciones",
              shortcut: "Ctrl+N",
              onRun: () => setCmdOpen(false),
            },
            {
              id: "export",
              label: "Exportar datos",
              group: "Acciones",
              onRun: () => setCmdOpen(false),
            },
            {
              id: "dark",
              label: "Cambiar tema",
              group: "Preferencias",
              onRun: () => { toggle(); setCmdOpen(false); },
            },
          ]}
        />
      </PrizmaRoot>
    </ToastProvider>
  );
}
