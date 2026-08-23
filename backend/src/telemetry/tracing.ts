/**
 * OpenTelemetry bootstrap. This backend is an ES module ("type": "module" in package.json),
 * so a plain top-level `import` here is NOT enough to guarantee auto-instrumentation patches
 * express/socket.io before the app's own modules load — ESM's loader pipeline works
 * differently from CommonJS's synchronous require() that the other three apps' tracing.ts
 * rely on. This file is loaded via Node's `--import` flag instead (see package.json's
 * "start" script), which registers it before the ESM loader begins loading index.ts at all.
 *
 * With OTEL_EXPORTER_OTLP_ENDPOINT unset, spans go to the console — traces work from the
 * first commit, no collector required.
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ConsoleSpanExporter, type SpanExporter } from '@opentelemetry/sdk-trace-node';
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

const traceExporter: SpanExporter = otlpEndpoint
  ? new OTLPTraceExporter({ url: `${otlpEndpoint.replace(/\/$/, '')}/v1/traces` })
  : new ConsoleSpanExporter();

const sdk = new NodeSDK({
  resource: defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? 'planning-poker-backend',
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '0.0.0',
    }),
  ),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // fs instrumentation is famously chatty (every read/write becomes a span) and adds
      // little value for an app whose I/O is almost entirely HTTP/websocket.
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();

// No SIGTERM/SIGINT hook here deliberately: adding one that calls process.exit() would race
// against any shutdown handling the app adds later. Losing the last few seconds of spans the
// batch processor hasn't flushed yet is the safer default.
