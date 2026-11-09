-- Update audit_logs_no_delete trigger to allow legitimate automated archival purges
DROP TRIGGER IF EXISTS `audit_logs_no_delete`;

CREATE TRIGGER `audit_logs_no_delete` BEFORE DELETE ON `audit_logs`
FOR EACH ROW
BEGIN
    IF @allow_audit_log_purge IS NULL OR @allow_audit_log_purge != 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Audit logs are append-only. Deletes are forbidden.';
    END IF;
END;

