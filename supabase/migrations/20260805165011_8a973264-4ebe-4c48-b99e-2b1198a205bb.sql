DROP TRIGGER IF EXISTS trg_rate_limit_messages ON public.messages;
CREATE TRIGGER trg_rate_limit_messages BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('msg', '30', '60', 'chat messages');

DROP TRIGGER IF EXISTS trg_rate_limit_system_messages ON public.system_messages;
CREATE TRIGGER trg_rate_limit_system_messages BEFORE INSERT ON public.system_messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('sysmsg', '30', '60', 'support messages');

DROP TRIGGER IF EXISTS trg_rate_limit_dispute_messages ON public.dispute_messages;
CREATE TRIGGER trg_rate_limit_dispute_messages BEFORE INSERT ON public.dispute_messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('dispmsg', '30', '60', 'dispute messages');

DROP TRIGGER IF EXISTS trg_rate_limit_orders ON public.orders;
CREATE TRIGGER trg_rate_limit_orders BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('order', '10', '600', 'new orders');

DROP TRIGGER IF EXISTS trg_rate_limit_order_deliveries ON public.order_deliveries;
CREATE TRIGGER trg_rate_limit_order_deliveries BEFORE INSERT ON public.order_deliveries
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('delivery', '20', '600', 'deliveries');

DROP TRIGGER IF EXISTS trg_rate_limit_order_requirements ON public.order_requirements;
CREATE TRIGGER trg_rate_limit_order_requirements BEFORE INSERT ON public.order_requirements
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('requirements', '20', '600', 'requirement submissions');

DROP TRIGGER IF EXISTS trg_rate_limit_gigs ON public.gigs;
CREATE TRIGGER trg_rate_limit_gigs BEFORE INSERT ON public.gigs
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('gig', '10', '3600', 'new gigs');

DROP TRIGGER IF EXISTS trg_rate_limit_gig_reviews ON public.gig_reviews;
CREATE TRIGGER trg_rate_limit_gig_reviews BEFORE INSERT ON public.gig_reviews
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('review', '10', '3600', 'reviews');

DROP TRIGGER IF EXISTS trg_rate_limit_withdrawals ON public.withdrawals;
CREATE TRIGGER trg_rate_limit_withdrawals BEFORE INSERT ON public.withdrawals
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('withdrawal', '5', '3600', 'withdrawal requests');

DROP TRIGGER IF EXISTS trg_rate_limit_support_tickets ON public.support_tickets;
CREATE TRIGGER trg_rate_limit_support_tickets BEFORE INSERT ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('ticket', '5', '3600', 'support tickets');

DROP TRIGGER IF EXISTS trg_rate_limit_buyer_support_tickets ON public.buyer_support_tickets;
CREATE TRIGGER trg_rate_limit_buyer_support_tickets BEFORE INSERT ON public.buyer_support_tickets
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('ticket_buyer', '5', '3600', 'support tickets');

DROP TRIGGER IF EXISTS trg_rate_limit_freelancer_support_tickets ON public.freelancer_support_tickets;
CREATE TRIGGER trg_rate_limit_freelancer_support_tickets BEFORE INSERT ON public.freelancer_support_tickets
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('ticket_freelancer', '5', '3600', 'support tickets');

DROP TRIGGER IF EXISTS trg_rate_limit_support_ticket_replies ON public.support_ticket_replies;
CREATE TRIGGER trg_rate_limit_support_ticket_replies BEFORE INSERT ON public.support_ticket_replies
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('ticket_reply', '30', '60', 'support replies');

DROP TRIGGER IF EXISTS trg_rate_limit_user_reports ON public.user_reports;
CREATE TRIGGER trg_rate_limit_user_reports BEFORE INSERT ON public.user_reports
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('report', '10', '3600', 'reports');

DROP TRIGGER IF EXISTS trg_rate_limit_verification_documents ON public.verification_documents;
CREATE TRIGGER trg_rate_limit_verification_documents BEFORE INSERT ON public.verification_documents
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('verification', '5', '3600', 'verification submissions');

DROP TRIGGER IF EXISTS trg_rate_limit_blue_tick_applications ON public.blue_tick_applications;
CREATE TRIGGER trg_rate_limit_blue_tick_applications BEFORE INSERT ON public.blue_tick_applications
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('bluetick', '3', '86400', 'blue tick applications');

DROP TRIGGER IF EXISTS trg_rate_limit_disputes ON public.disputes;
CREATE TRIGGER trg_rate_limit_disputes BEFORE INSERT ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('dispute', '5', '3600', 'disputes');

DROP TRIGGER IF EXISTS trg_rate_limit_conversations ON public.conversations;
CREATE TRIGGER trg_rate_limit_conversations BEFORE INSERT ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.enforce_insert_rate_limit('conversation', '20', '600', 'new conversations');