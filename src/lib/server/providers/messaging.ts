export type NotificationChannel='Web'|'SMS'|'Email'|'WhatsApp'|'Push'
export interface NotificationMessage { eventId:string; to:string; channel:NotificationChannel; template:string; variables:Record<string,string> }
export interface MessagingProviderAdapter { readonly providerCode:string; readonly mode:'DEMO'|'LIVE'; send(message:NotificationMessage):Promise<{accepted:boolean;providerReference?:string;reason?:string}>; health():Promise<{healthy:boolean;detail:string}> }

export class DemoMessagingProvider implements MessagingProviderAdapter {
  readonly providerCode='DEMO_MESSAGING'; readonly mode='DEMO' as const
  async send(message:NotificationMessage){ return {accepted:true,providerReference:`demo_msg_${message.eventId}`,reason:'DEMO/SIMULATED'} }
  async health(){ return {healthy:true,detail:'Deterministic notification simulation.'} }
}
