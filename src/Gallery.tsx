/**
 * Gallery.tsx — visual QA gallery of the @olympo/ui design system.
 * Renders every component (variants, sizes, tones, interactive overlays)
 * inside a OlympoRoot module="portal" surface.
 *
 * Open via ?gallery in the URL (wired in App.tsx).
 */
import { useState } from "react";
import {
  OlympoRoot,
  useTheme,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  type BadgeTone,
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
  TableWrap,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  type AlertTone,
  Stat,
  Progress,
  Spinner,
  Skeleton,
  Tabs,
  Breadcrumb,
  Pagination,
  EmptyState,
  Avatar,
  Tag,
  type TagTone,
  Divider,
  Tooltip,
  IconButton,
  Modal,
  ModalFooter,
  Drawer,
  ToastProvider,
  useToast,
  Row,
  Stack,
  Grid,
  Spacer,
} from "@olympo/ui";

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

/** Toast trigger — must live under a ToastProvider. */
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

export function Gallery() {
  const { theme, toggle } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [seg, setSeg] = useState("flow");
  const [radio, setRadio] = useState("a");
  const [page, setPage] = useState(3);

  return (
    <ToastProvider>
      <OlympoRoot
        module="portal"
        style={{ minHeight: "100vh", background: "var(--c-bg)" }}
      >
        <header className="cui-shell__topbar" style={{ position: "sticky" }}>
          <strong
            style={{
              fontFamily: "var(--c-font-display)",
              fontSize: 20,
              letterSpacing: "-0.02em",
            }}
          >
            @olympo/ui — Galería QA
          </strong>
          <Badge tone="primary">design system</Badge>
          <Spacer />
          <Button variant="ghost" size="sm" onClick={toggle}>
            {theme === "dark" ? "☀ Claro" : "☾ Oscuro"}
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
          {/* BUTTON — variants x sizes */}
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
              <Button leftIcon={<span>←</span>}>Con icono izq.</Button>
              <Button rightIcon={<span>→</span>}>Con icono der.</Button>
              <IconButton aria-label="Acción">★</IconButton>
            </Row>
            <Button block variant="accent">
              Botón block
            </Button>
          </Section>

          {/* CARD */}
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

          {/* BADGE */}
          <Section title="Badge">
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
          </Section>

          {/* FORM CONTROLS */}
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
                  <Input id="g-input-grp" placeholder="cauce.app" />
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
          </Section>

          {/* TABLE */}
          <Section title="Table">
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
                    <Td>Graf</Td>
                    <Td>
                      <Badge tone="success">activo</Badge>
                    </Td>
                    <Td>$1,240</Td>
                  </Tr>
                  <Tr>
                    <Td>EMW</Td>
                    <Td>
                      <Badge tone="warning">pendiente</Badge>
                    </Td>
                    <Td>$880</Td>
                  </Tr>
                  <Tr>
                    <Td>Sinergia</Td>
                    <Td>
                      <Badge tone="danger">vencido</Badge>
                    </Td>
                    <Td>$2,015</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableWrap>
            <Table compact>
              <Thead>
                <Tr>
                  <Th>Compacta</Th>
                  <Th>B</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>fila 1</Td>
                  <Td>x</Td>
                </Tr>
                <Tr>
                  <Td>fila 2</Td>
                  <Td>y</Td>
                </Tr>
              </Tbody>
            </Table>
          </Section>

          {/* ALERT */}
          <Section title="Alert">
            {ALERT_TONES.map((tone) => (
              <Alert key={tone} tone={tone} title={`Alerta ${tone}`}>
                Mensaje de ejemplo para la alerta de tipo {tone}.
              </Alert>
            ))}
          </Section>

          {/* STAT */}
          <Section title="Stat">
            <Grid cols="repeat(auto-fit, minmax(180px, 1fr))" gap={16}>
              <Stat label="Ingresos" value="$48.2k" delta="12.4%" trend="up" />
              <Stat label="Churn" value="2.1%" delta="0.3%" trend="down" />
              <Stat label="Usuarios" value="3,418" delta="58" trend="up" />
              <Stat label="Tickets" value="12" />
            </Grid>
          </Section>

          {/* PROGRESS / SPINNER / SKELETON */}
          <Section title="Progress · Spinner · Skeleton">
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
          </Section>

          {/* TABS */}
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

          {/* BREADCRUMB / PAGINATION */}
          <Section title="Breadcrumb · Pagination">
            <Breadcrumb
              items={[
                { label: "Inicio", href: "#" },
                { label: "Productos", href: "#" },
                { label: "Graf" },
              ]}
            />
            <Pagination page={page} pageCount={10} onChange={setPage} />
          </Section>

          {/* EMPTY STATE */}
          <Section title="EmptyState">
            <EmptyState
              icon={<span style={{ fontSize: 32 }}>📭</span>}
              title="Sin resultados"
              description="No encontramos nada que coincida con tu búsqueda."
              action={<Button size="sm">Limpiar filtros</Button>}
            />
          </Section>

          {/* AVATAR / TAG / DIVIDER / TOOLTIP */}
          <Section title="Avatar · Tag · Divider · Tooltip">
            <Row wrap gap={12} style={{ alignItems: "center" }}>
              <Avatar name="Ada Lovelace" />
              <Avatar name="Grace Hopper" size={56} />
              <Avatar
                name="Olympo"
                src="https://invalid.example/none.png"
                size={40}
              />
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

          {/* OVERLAYS: MODAL / DRAWER / TOAST */}
          <Section title="Overlays — Modal · Drawer · Toast">
            <Row wrap gap={10}>
              <Button onClick={() => setModalOpen(true)}>Abrir Modal</Button>
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                Abrir Drawer
              </Button>
            </Row>
            <ToastDemo />
          </Section>
        </main>

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
      </OlympoRoot>
    </ToastProvider>
  );
}
